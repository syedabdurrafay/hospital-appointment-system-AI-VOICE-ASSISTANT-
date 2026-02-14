import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { Audit } from "../models/auditSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { getAvailableSlots, checkDoctorAvailability } from "./appointmentController.js";
import OpenAI from "openai";
import axios from "axios";
import jwt from "jsonwebtoken";

const getAIClient = () => {
    const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.GROK_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('AI API key not configured. Please set XAI_API_KEY, GROK_API_KEY, GROK_KEY, or GROQ_API_KEY in .env file');
    }

    const isGroq = apiKey.startsWith('gsk_');
    const baseURL = isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.x.ai/v1';

    console.log(`🤖 Using ${isGroq ? 'Groq' : 'Grok (xAI)'} API`);

    return {
        client: new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL
        }),
        model: isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta'
    };
};

// Helper to get YYYY-MM-DD in the local perspective of the date object
const toLocalDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getSystemPrompt = (userContext, currentTime) => {
    const now = currentTime ? new Date(currentTime) : new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let userContextString = "";
    if (userContext && userContext.firstName) {
        userContextString = `PATIENT CONTEXT: You are speaking with ${userContext.firstName} ${userContext.lastName} (ID: ${userContext._id}). DOB: ${toLocalDateString(userContext.dob)}.`;
    }

    return `You are a FULLY AUTOMATED AI Clinic Receptionist.
Your goal is to provide a frictionless, "magical" booking experience for our clinic.
CURRENT DATE: ${today}
CURRENT TIME: ${time}

────────────────────────────────────────
STRICT RULES (MUST FOLLOW)
────────────────────────────────────────
• BE DECISIVE: If a user says "book me with Dr. X tomorrow", find the BEST slot and BOOK it immediately (after identification).
• ONE QUESTION AT A TIME: Do not overwhelm the user.
• NO TECHNICAL JARGON: No "APIs", "systems", or "tools".
• AUTO-IDENTIFY: If ${userContext && userContext.firstName ? 'Identified (Logged In)' : 'NOT Identified'}, adapt flow below.
${userContextString}

────────────────────────────────────────
AUTOMATION FLOW
────────────────────────────────────────

STATE 1 — CONTEXT CHECK
If user is Logged In (Context Provided): DO NOT ask for Name/DOB. Proceed directly to booking ("When would you like to come in?").
If user is NOT Logged In: Explain nicely: "To book an appointment, please register or log in to our app first for security reasons." Do NOT ask for details manually.

STATE 2 — INTENT EXTRACTION
Understand symbols/symptoms:
- "Heart" -> Cardiologist
- "Skin" -> Dermatologist
- "Fever/Cold" -> General Physician
- "Eyes" -> Ophthalmologist
Use \`getDoctorsInfo\` to find who matches.

STATE 3 — SMART BOOKING
Ask: "When would you like to visit us? (e.g. tomorrow morning, next Monday)"
- If they give a vague time like "tomorrow evening", find the best slot using \`checkAvailability\`.
- **THE MAGIC**: If their preferred time is busy, the system will AUTO-PICK the nearest available slot. You just need to confirm it.

STATE 4 — INSTANT CONFIRMATION
Once doctor and date are clear, say: "I've found a great slot for you with Dr. [Name] on [Date] at [Time]. Should I go ahead and book that for you?"

STATE 5 — FINALIZATION
Call: bookAppointment(...)
After confirmation, say: "Perfect! You're all set. You'll receive a notification shortly. We look forward to seeing you."

**CRITICAL**: It is ${time}. Convert "tomorrow", "next week" into YYYY-MM-DD relative to ${today}.
Always prioritize speed and accuracy. No unnecessary talking.`;
};

// Wrapper ensuring date format is robust
async function checkSlotsWrapper(date, queryTerm, referenceTime) {
    // Basic date parsing fix if AI sends "14 January" instead of "2025-01-14"
    let targetDate = date;
    if (!date.includes('-')) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            targetDate = d.toISOString().split('T')[0];
        }
    }

    console.log(`🔎 Checking availability for ${targetDate}(Query: ${queryTerm || 'All'})`);

    // 1. Find Doctors
    let query = { role: 'Doctor', isActive: true };
    if (queryTerm && queryTerm.toLowerCase() !== 'general' && queryTerm.toLowerCase() !== 'doctor') {
        query.$or = [
            { firstName: new RegExp(queryTerm, 'i') },
            { lastName: new RegExp(queryTerm, 'i') },
            { specialization: new RegExp(queryTerm, 'i') }
        ];
    }

    let doctors = await User.find(query);
    if (doctors.length === 0 && (!queryTerm || queryTerm === 'General')) {
        doctors = await User.find({ role: 'Doctor', isActive: true });
    }

    if (doctors.length === 0) return { available: false, slots: [], reason: 'No doctors found' };

    // Check first matching doctor
    const doctor = doctors[0];

    // Use Shared Logic from Appointment Controller
    const availabilityCheck = await checkDoctorAvailability(doctor._id, targetDate);
    if (!availabilityCheck.available) {
        return { available: false, slots: [], doctor, reason: availabilityCheck.reason };
    }

    // Get Slots using Shared Logic - Pass referenceTime
    const slots = await getAvailableSlots(doctor._id, targetDate, 30, referenceTime);

    // Convert Slots to display format (12h)
    const formattedSlots = slots.map(s => {
        const [h, m] = s.split(':').map(Number);
        const p = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${m.toString().padStart(2, '0')} ${p} `;
    });

    return {
        available: formattedSlots.length > 0,
        slots: formattedSlots,
        doctor,
        reason: formattedSlots.length === 0 ? 'All slots booked' : null
    };
}

async function getAvailableSlotsForDate(date, queryTerm, referenceTime) {
    try {
        const result = await checkSlotsWrapper(date, queryTerm, referenceTime);
        if (result.available) {
            return {
                available: true,
                slots: result.slots,
                info: `Yes! ${result.doctor.firstName} is available on ${date}.`,
                doctorId: result.doctor._id.toString(),
                doctorName: `Dr.${result.doctor.firstName} ${result.doctor.lastName} `,
                department: result.doctor.specialization
            };
        }

        // Fallback: Check next 3 days
        let suggestions = [];
        let currentDate = new Date(date);

        for (let i = 1; i <= 3; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            const nextDateStr = toLocalDateString(currentDate);
            const nextResult = await checkSlotsWrapper(nextDateStr, queryTerm, referenceTime);

            if (nextResult.available) {
                suggestions.push({
                    date: nextDateStr,
                    slots: nextResult.slots.slice(0, 3),
                    doctor: `Dr.${nextResult.doctor.firstName} `
                });
            }
        }

        if (suggestions.length > 0) {
            return {
                available: false,
                reason: `No slots on ${date}. How about these closest alternatives ? `,
                suggestions: suggestions,
                doctorId: suggestions[0].doctor ? "?" : "ask_user"
            };
        }

        return { available: false, reason: 'No slots available for this doctor in the coming days.' };

    } catch (error) {
        console.error('Error getting available slots:', error);
        return { available: false, reason: 'System error checking availability', slots: [] };
    }
}

async function identifyPatient(firstName, lastName, dob) {
    try {
        if (!firstName || !lastName || !dob || firstName.toLowerCase().includes('name') || dob.includes('[') || dob.includes('DD')) {
            return { found: false, message: "Please provide a valid Full Name and Date of Birth." };
        }

        console.log(`🔍 Identifying patient: ${firstName} ${lastName}, DOB: ${dob} `);

        // Normalize DOB to YYYY-MM-DD
        let normalizedDob = dob;
        if (dob && !dob.includes('-')) {
            const d = new Date(dob);
            if (!isNaN(d.getTime())) {
                normalizedDob = d.toISOString().split('T')[0];
            }
        }

        const patient = await User.findOne({
            firstName: new RegExp(`^ ${firstName} $`, 'i'),
            lastName: new RegExp(`^ ${lastName} $`, 'i'),
            dob: normalizedDob,
            role: 'Patient'
        });

        if (patient) {
            return {
                found: true,
                patient: {
                    id: patient._id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    email: patient.email,
                    phone: patient.phone,
                    dob: patient.dob
                },
                message: "Patient identified successfully."
            };
        }

        return { found: false, message: "Patient not found in our records." };
    } catch (error) {
        console.error("Identify Patient Error", error);
        return { found: false, message: "Error looking up patient." };
    }
}

async function getDoctorsInfo(referenceTime) {
    try {
        const doctors = await User.find({ role: 'Doctor', isActive: true });
        if (doctors.length === 0) return { success: false, message: "No doctors found." };

        const today = referenceTime ? new Date(referenceTime) : new Date();
        const info = [];

        for (const doc of doctors) {
            let foundSlot = null;
            let checkDate = new Date(today);

            // Check next 3 days
            for (let i = 0; i < 3; i++) {
                const dateStr = toLocalDateString(checkDate);

                // Use shared logic
                const slots = await getAvailableSlots(doc._id, dateStr, 30, today);

                // Check if actually available (day off etc)
                const avail = await checkDoctorAvailability(doc._id, dateStr);

                if (avail.available && slots.length > 0) {
                    // manual format
                    const s = slots[0];
                    const [h, m] = s.split(':').map(Number);
                    const p = h >= 12 ? 'PM' : 'AM';
                    const dh = h % 12 || 12;

                    foundSlot = { date: dateStr, time: `${dh}:${m.toString().padStart(2, '0')} ${p} ` };
                    break;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }

            info.push({
                id: doc._id,
                name: `Dr.${doc.firstName} ${doc.lastName} `,
                specialization: doc.specialization,
                nextAvailable: foundSlot ? `${foundSlot.date} at ${foundSlot.time} ` : "Fully booked or working hours ended for next 3 days"
            });
        }

        return {
            success: true,
            doctors: info,
            message: "Showing next available slots for all doctors."
        };
    } catch (error) {
        console.error("GetDoctorsInfo Error", error);
        return { success: false, message: "Error fetching doctor info" };
    }
}

async function createAppointment(patientDataInput, appointmentData, doctorId, loggedInUser) {
    try {
        const doctor = await User.findById(doctorId);
        if (!doctor) return { success: false, message: 'Doctor not found' };

        let patient = null;
        let patientId = null;

        // 1. Identify Patient - PRIORITY TO LOGGED IN USER
        if (loggedInUser) {
            patient = loggedInUser;
            console.log(`✅ Using logged-in user context: ${patient.firstName} (ID: ${patient._id})`);
        } else if (patientDataInput && patientDataInput.email) {
            patient = await User.findOne({ email: patientDataInput.email });
            if (patient) console.log(`🔍 Found patient by email: ${patient.email}`);
        }

        // 2. Secondary Identification by Name/DOB (if not logged in)
        if (!patient && patientDataInput && (patientDataInput.firstName || patientDataInput.lastName) && patientDataInput.dob) {
            try {
                // Robust DOB match: covers different times of the same day using UTC
                const dobStr = patientDataInput.dob.split('T')[0];
                const startDay = new Date(`${dobStr}T00:00:00.000Z`);
                const endDay = new Date(`${dobStr}T23:59:59.999Z`);

                const fName = (patientDataInput.firstName || "").trim();
                const lName = (patientDataInput.lastName || "").trim();
                const fullName = (fName + " " + lName).trim();

                console.log(`🔎 Searching for patient: "${fullName}" DOB: ${dobStr}`);

                // Search by exact name match OR combined name match
                patient = await User.findOne({
                    $or: [
                        { firstName: new RegExp(`^${fName}$`, 'i'), lastName: new RegExp(`^${lName}$`, 'i') },
                        { firstName: new RegExp(`^${fullName}$`, 'i') },
                        { lastName: new RegExp(`^${fullName}$`, 'i') }
                    ],
                    dob: { $gte: startDay, $lte: endDay },
                    role: 'Patient'
                });
                if (patient) console.log(`🔍 Found patient by name and DOB: ${patient.firstName} ${patient.lastName} (${patient._id})`);
            } catch (err) {
                console.error("Match DOB Error:", err);
            }
        }

        // 3. Last resort: IF NOT FOUND, RETURN ERROR (Do NOT create temp user)
        if (!patient) {
            console.log("❌ Booking failed: User not registered.");
            return {
                success: false,
                message: "I cannot find a registered account with those details. For security and medical history tracking, please register or log in to our application first to book an appointment."
            };
        }

        patientId = patient._id;

        // 4. Enforce Max 2 Appointments Per Day
        const dailyCount = await Appointment.countDocuments({
            patientId: patientId,
            'appointment.date': appointmentData.date,
            status: { $ne: 'Cancelled' }
        });

        if (dailyCount >= 2) {
            return {
                success: false,
                message: `Booking failed. You have already scheduled ${dailyCount} appointments for ${appointmentData.date}. Maximum is 2 per day.`
            };
        }

        // 5. Smart Slot Assignment
        const freeSlots = await getAvailableSlots(doctorId, appointmentData.date, 30);
        let finalTime = appointmentData.time;

        if (!finalTime || !freeSlots.includes(finalTime)) {
            if (freeSlots.length === 0) {
                return { success: false, message: `Our clinic is fully booked on ${appointmentData.date}. Please pick another date.` };
            }
            finalTime = freeSlots[0]; // Auto-pick nearest
        }

        // 6. Create the Appointment
        const appointment = await Appointment.create({
            patient: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                dob: patient.dob,
                gender: patient.gender,
                aadhar: patient.aadhar
            },
            appointment: {
                date: appointmentData.date,
                time: finalTime,
                department: appointmentData.department || doctor.specialization || 'General',
                symptoms: appointmentData.reason || 'AI Voice Booking',
                hasVisited: false
            },
            doctorId: doctor._id,
            doctor: {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization
            },
            patientId: patientId,
            status: 'Accepted'
        });

        // 7. Automated Notifications
        try {
            // Notify Patient
            await Notification.create({
                userId: patientId,
                title: 'Appointment Confirmed',
                body: `Your visit with Dr. ${doctor.lastName} is confirmed for ${appointmentData.date} at ${finalTime}.`,
                data: { appointmentId: appointment._id },
                read: false
            });

            // Notify Doctor
            await Notification.create({
                userId: doctor._id,
                title: 'New Booking Alert',
                body: `New patient: ${patient.firstName} ${patient.lastName} scheduled for ${appointmentData.date} at ${finalTime}.`,
                data: { appointmentId: appointment._id, patientId: patient._id },
                read: false
            });

            // Notify Admins
            const admins = await User.find({ role: 'Admin' });
            for (const admin of admins) {
                await Notification.create({
                    userId: admin._id,
                    title: 'System Booking Alert',
                    body: `AI Assistant booked ${patient.firstName} ${patient.lastName} with Dr. ${doctor.lastName} on ${appointmentData.date}.`,
                    data: { appointmentId: appointment._id },
                    read: false
                });
            }
            console.log(`🔔 Notifications sent to Patient, Doctor, and Admins.`);
        } catch (e) {
            console.error('Notification failed:', e);
        }

        return {
            success: true,
            message: `DONE! Your appointment at our clinic is confirmed with Dr. ${doctor.firstName} ${doctor.lastName} for ${appointmentData.date} at ${finalTime}.`,
            details: {
                doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                when: `${appointmentData.date} at ${finalTime}`
            }
        };

    } catch (error) {
        console.error('Booking Error:', error);
        return { success: false, message: 'Failed to book: ' + error.message };
    }
}

export const chatWithAI = catchAsyncErrors(async (req, res, next) => {
    const { message, history = [], context = {} } = req.body;

    if (!message) return next(new ErrorHandler('Message is required', 400));

    if (!process.env.XAI_API_KEY && !process.env.GROK_API_KEY && !process.env.GROK_KEY && !process.env.GROQ_API_KEY) {
        return next(new ErrorHandler('AI API key not configured', 500));
    }

    try {
        const messages = [
            { role: 'system', content: getSystemPrompt(context.user, context.currentTime) },
            ...history,
            { role: 'user', content: message }
        ];

        const tools = [
            {
                type: 'function',
                function: {
                    name: 'identifyPatient',
                    description: 'Lookup patient by name and date of birth.',
                    parameters: {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            dob: { type: 'string', description: "YYYY-MM-DD" }
                        },
                        required: ['firstName', 'lastName', 'dob']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getDoctorsInfo',
                    description: 'Get list of all doctors and their next available slots.',
                    parameters: { type: 'object', properties: {} }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'checkAvailability',
                    description: 'Check specific date availability. Date format MUST be YYYY-MM-DD.',
                    parameters: {
                        type: 'object',
                        properties: {
                            date: { type: 'string', description: "YYYY-MM-DD format" },
                            query: { type: 'string' }
                        },
                        required: ['date']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'bookAppointment',
                    description: 'Book final appointment',
                    parameters: {
                        type: 'object',
                        properties: {
                            patientData: {
                                type: 'object',
                                properties: {
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    email: { type: 'string' },
                                    dob: { type: 'string' }
                                }
                            },
                            appointmentData: {
                                type: 'object',
                                properties: {
                                    date: { type: 'string' },
                                    time: { type: 'string' },
                                    reason: { type: 'string' }
                                },
                                required: ['date', 'time']
                            },
                            doctorId: { type: 'string' }
                        },
                        required: ['appointmentData', 'doctorId']
                    }
                }
            }
        ];

        const { client, model } = getAIClient();
        const completion = await client.chat.completions.create({
            model: model,
            messages: messages,
            tools: tools,
            tool_choice: 'auto',
            temperature: 0.5,
            max_tokens: 600
        });

        const responseMessage = completion.choices[0].message;

        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const fnName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            let result;

            if (fnName === 'identifyPatient') {
                result = await identifyPatient(args.firstName, args.lastName, args.dob);
                // If patient found, update context for future turns in this request
                if (result.found) {
                    context.user = result.patient;
                }
            } else if (fnName === 'getDoctorsInfo') {
                result = await getDoctorsInfo(context.currentTime);
            } else if (fnName === 'checkAvailability') {
                result = await getAvailableSlotsForDate(args.date, args.query, context.currentTime);
            } else if (fnName === 'bookAppointment') {
                if (!args.patientData && context.user) {
                    args.patientData = {
                        firstName: context.user.firstName,
                        lastName: context.user.lastName,
                        email: context.user.email,
                        dob: context.user.dob,
                        phone: context.user.phone,
                        gender: context.user.gender
                    };
                }
                if (args.patientData && !args.patientData.email) {
                    args.patientData.email = `voice.${Date.now()} @temp.com`;
                }

                result = await createAppointment(args.patientData, args.appointmentData, args.doctorId, context.user);
            }

            const followUp = [
                ...messages,
                responseMessage,
                {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                }
            ];

            const final = await client.chat.completions.create({
                model: model,
                messages: followUp
            });

            return res.status(200).json({
                success: true,
                response: final.choices[0].message.content,
                identifiedUser: context.user, // Return identified user if any
                conversationHistory: [
                    ...history,
                    { role: 'user', content: message },
                    { role: 'assistant', content: final.choices[0].message.content }
                ]
            });
        }

        res.status(200).json({
            success: true,
            response: responseMessage.content,
            identifiedUser: context.user, // Return identified user if any
            conversationHistory: [
                ...history,
                { role: 'user', content: message },
                { role: 'assistant', content: responseMessage.content }
            ]
        });

    } catch (error) {
        console.error("AI Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

export const processVoiceAssistant = catchAsyncErrors(async (req, res, next) => {
    const { text, patientId } = req.body;

    if (!text) return next(new ErrorHandler("Text is required", 400));

    console.log("---- processVoiceAssistant START ----");
    console.log("Request Body Keys:", Object.keys(req.body));
    console.log(`Received patientId: '${patientId}' (Type: ${typeof patientId})`);

    try {
        // Validation: Ensure patientId is not the string "null" from frontend
        let actualPatientId = null;
        if (patientId && patientId !== "null" && patientId !== "undefined" && patientId !== "") {
            actualPatientId = patientId;
        }

        // FALLBACK: Try to get patientId from Authorization header or Cookies if missing
        if (!actualPatientId) {
            try {
                let token = null;
                const authHeader = req.headers?.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                } else if (req.cookies) {
                    token = req.cookies.token || req.cookies.patientToken;
                }

                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (decoded && decoded.id) {
                        actualPatientId = decoded.id;
                        console.log(`✅ Recovered patientId from TOKEN: ${actualPatientId}`);
                    }
                }
            } catch (authErr) {
                console.log(`⚠️ Token recovery failed: ${authErr.message}`);
            }
        }

        console.log(`Resolved actualPatientId: ${actualPatientId}`);

        if (actualPatientId) {
            const userCheck = await User.findById(actualPatientId);
            console.log(`User Database Check: ${userCheck ? `Found ${userCheck.firstName}` : 'Not Found'}`);
        }

        // Fetch registered doctors to provide context to AI
        const registeredDoctors = await User.find({ role: 'Doctor', isActive: true }, 'firstName lastName specialization');

        // 1️⃣ Call Python AI Service
        console.log(`📡 Calling Python Service for "${text}"...`);
        const aiResponse = await axios.post("http://localhost:8000/process-voice", {
            text,
            patientId: actualPatientId,
            doctors: registeredDoctors.map(d => ({
                id: d._id,
                name: `Dr. ${d.firstName} ${d.lastName}`,
                specialization: d.specialization
            }))
        });

        console.log(`✅ Python Service responded with:`, JSON.stringify(aiResponse.data).substring(0, 200) + "...");

        const { structuredData, doctorSummary, conversation, requiresConfirmation, pendingBooking } = aiResponse.data;

        let finalReply = conversation[conversation.length - 1].content;
        let bookingResult = null;
        let requiresAction = false;

        // If the AI indicates we need confirmation or more information
        if (requiresConfirmation) {
            console.log(`🔄 AI requires confirmation or more information`);
            requiresAction = true;
        }

        // AUTOMATION: Only book if AI has indicated it's ready (has all info AND user confirmed)
        // We'll check if the AI has sent a bookingRequest in the response
        if (aiResponse.data.bookingRequest) {
            const bookingReq = aiResponse.data.bookingRequest;

            console.log(`🚀 Booking request received with confirmation:`, bookingReq);

            // Find doctor
            let doctor = null;
            if (bookingReq.doctorId) {
                doctor = await User.findById(bookingReq.doctorId);
            } else if (bookingReq.doctorName || bookingReq.specialization) {
                let query = { role: 'Doctor' };

                if (bookingReq.doctorName) {
                    const searchName = bookingReq.doctorName.replace(/Dr\.\s*|Doctor\s*/i, "").trim();
                    const nameParts = searchName.split(/\s+/);
                    const nameRegex = new RegExp(nameParts.join('|'), 'i');

                    query.$or = [
                        { firstName: nameRegex },
                        { lastName: nameRegex }
                    ];
                } else if (bookingReq.specialization) {
                    query.specialization = new RegExp(bookingReq.specialization, 'i');
                }

                const doctors = await User.find(query);
                if (doctors.length > 0) {
                    doctor = doctors[0];
                }
            }

            if (doctor) {
                const patientData = {
                    firstName: bookingReq.firstName || structuredData?.firstName,
                    lastName: bookingReq.lastName || structuredData?.lastName,
                    dob: bookingReq.dob || structuredData?.dob,
                    email: bookingReq.email || structuredData?.email || `voice.${Date.now()}@temp.com`
                };

                const appointmentData = {
                    date: bookingReq.date,
                    time: bookingReq.time,
                    department: doctor.specialization,
                    reason: bookingReq.reason || doctorSummary || structuredData?.symptoms || "Automated Clinic Voice Booking"
                };

                // Identify patient
                let loggedInUser = null;
                if (actualPatientId) {
                    loggedInUser = await User.findById(actualPatientId);
                }

                // Call createAppointment
                bookingResult = await createAppointment(patientData, appointmentData, doctor._id, loggedInUser);

                if (bookingResult.success) {
                    finalReply = bookingResult.message;
                    // Update conversation with the confirmation
                    conversation.push({
                        role: "assistant",
                        content: finalReply
                    });
                    console.log(`✅ Appointment saved successfully!`);
                } else {
                    finalReply = bookingResult.message;
                    conversation.push({
                        role: "assistant",
                        content: finalReply
                    });
                }
            } else {
                finalReply = "I'm sorry, I couldn't find the specified doctor in our clinic database.";
                conversation.push({
                    role: "assistant",
                    content: finalReply
                });
            }
        }

        // 2️⃣ Save audit log
        await Audit.create({
            action: "VOICE_ASSISTANT_INTERACTION",
            targetType: "AI",
            details: {
                text,
                structuredData,
                doctorSummary,
                bookingResult,
                requiresConfirmation
            }
        });

        res.status(200).json({
            success: true,
            structuredData,
            doctorSummary,
            conversation,
            bookingResult,
            requiresAction
        });

    } catch (error) {
        console.error("Python AI Service Error:", error.message);
        return next(new ErrorHandler("AI Service unreachable or error: " + error.message, 500));
    }
});
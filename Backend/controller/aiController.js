import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { Audit } from "../models/auditSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { getAvailableSlots, checkDoctorAvailability } from "./appointmentController.js";
import OpenAI from "openai";

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

const getSystemPrompt = (userContext) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let userContextString = "";
    if (userContext && userContext.firstName) {
        userContextString = `USER CONTEXT: Connected User: ${userContext.firstName} ${userContext.lastName} (ID: ${userContext._id}). Email: ${userContext.email}.`;
    }

    return `You are a PROACTIVE Medical Receptionist.
CURRENT DATE: ${today}
${userContextString}

YOUR ROLE:
You must strictly help the user book an appointment.

**CRITICAL INSTRUCTIONS:**
1. **TOOL USAGE IS MANDATORY**: Do NOT describe what you will do. JUST DO IT.
   - If user says "Check availablity for 14 Jan", call \`checkAvailability\` with date "2026-01-14".
   - If user says "Book an appointment", call \`getDoctorsInfo\` to find next slots.
   
2. **DATE HANDLING**:
   - Always convert dates to YYYY-MM-DD format based on CURRENT DATE (${today}).
   - Example: If current year is 2026 and user says "14 Jan", use "2026-01-14".

3. **RESPONSE AFTER TOOL**:
   - If \`getDoctorsInfo\` returns available slots, propose them: "We have Dr. X available on [Time] and Dr. Y on [Time]. Which do you prefer?"
   - If \`checkAvailability\` returns true, say: "Yes, we have slots at [List Slots]. Shall I book one?"
   - If slots are NOT available, the tool will provide suggestions. Present them.

4. **BOOKING**:
   - Only call \`bookAppointment\` when user confirms a specific doctor and time.
   - After booking tool returns success, say: "Confirmed! Your appointment with Dr. X is booked for [Date] at [Time]."

DO NOT output raw XML tags or function names in text. Use the provided "tools" interface.`;
};

// Wrapper ensuring date format is robust
async function checkSlotsWrapper(date, queryTerm) {
    // Basic date parsing fix if AI sends "14 January" instead of "2025-01-14"
    let targetDate = date;
    if (!date.includes('-')) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            targetDate = d.toISOString().split('T')[0];
        }
    }

    console.log(`🔎 Checking availability for ${targetDate} (Query: ${queryTerm || 'All'})`);

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

    // Get Slots using Shared Logic
    const slots = await getAvailableSlots(doctor._id, targetDate);

    // Convert Slots to display format (12h)
    const formattedSlots = slots.map(s => {
        const [h, m] = s.split(':').map(Number);
        const p = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${m.toString().padStart(2, '0')} ${p}`;
    });

    return {
        available: formattedSlots.length > 0,
        slots: formattedSlots,
        doctor,
        reason: formattedSlots.length === 0 ? 'All slots booked' : null
    };
}

async function getAvailableSlotsForDate(date, queryTerm) {
    try {
        const result = await checkSlotsWrapper(date, queryTerm);
        if (result.available) {
            return {
                available: true,
                slots: result.slots,
                info: `Yes! ${result.doctor.firstName} is available on ${date}.`,
                doctorId: result.doctor._id.toString(),
                doctorName: `Dr. ${result.doctor.firstName} ${result.doctor.lastName}`,
                department: result.doctor.specialization
            };
        }

        // Fallback: Check next 3 days
        let suggestions = [];
        let currentDate = new Date(date);

        for (let i = 1; i <= 3; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            const nextDateStr = currentDate.toISOString().split('T')[0];
            const nextResult = await checkSlotsWrapper(nextDateStr, queryTerm);

            if (nextResult.available) {
                suggestions.push({
                    date: nextDateStr,
                    slots: nextResult.slots.slice(0, 3),
                    doctor: `Dr. ${nextResult.doctor.firstName}`
                });
            }
        }

        if (suggestions.length > 0) {
            return {
                available: false,
                reason: `No slots on ${date}. How about these closest alternatives?`,
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

async function getDoctorsInfo() {
    try {
        const doctors = await User.find({ role: 'Doctor', isActive: true });
        if (doctors.length === 0) return { success: false, message: "No doctors found." };

        const today = new Date();
        const info = [];

        for (const doc of doctors) {
            let foundSlot = null;
            let checkDate = new Date(today);

            // Check next 3 days
            for (let i = 0; i < 3; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];

                // Use shared logic
                const slots = await getAvailableSlots(doc._id, dateStr);

                // Check if actually available (day off etc)
                const avail = await checkDoctorAvailability(doc._id, dateStr);

                if (avail.available && slots.length > 0) {
                    // manual format
                    const s = slots[0];
                    const [h, m] = s.split(':').map(Number);
                    const p = h >= 12 ? 'PM' : 'AM';
                    const dh = h % 12 || 12;

                    foundSlot = { date: dateStr, time: `${dh}:${m.toString().padStart(2, '0')} ${p}` };
                    break;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }

            info.push({
                id: doc._id,
                name: `Dr. ${doc.firstName} ${doc.lastName}`,
                specialization: doc.specialization,
                nextAvailable: foundSlot ? `${foundSlot.date} at ${foundSlot.time}` : "Fully booked for 3 days"
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

        let patient;
        let patientId;

        if (loggedInUser && loggedInUser._id) {
            patient = await User.findById(loggedInUser._id);
            patientId = loggedInUser._id;
        }

        if (!patient) {
            patient = await User.findOne({ email: patientDataInput.email });
            if (!patient) {
                try {
                    patient = await User.create({
                        firstName: patientDataInput.firstName,
                        lastName: patientDataInput.lastName,
                        email: patientDataInput.email,
                        phone: patientDataInput.phone || '0000000000',
                        dob: patientDataInput.dob,
                        gender: patientDataInput.gender || 'Other',
                        password: Math.random().toString(36).slice(-8),
                        role: 'Patient',
                        aadhar: Math.floor(100000000000 + Math.random() * 900000000000).toString()
                    });
                } catch (e) {
                    patient = await User.findOne({ email: patientDataInput.email });
                }
            }
            patientId = patient._id;
        }

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
                time: appointmentData.time,
                department: appointmentData.department || doctor.doctDptmnt || doctor.specialization || 'General',
                symptoms: appointmentData.reason || 'Voice Booking',
                hasVisited: false
            },
            doctorId: doctor._id,
            doctor: {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization
            },
            patientId: patientId,
            status: 'Pending'
        });

        // Notifications
        try {
            await Notification.create({
                userId: patientId,
                type: 'Appointment',
                message: `Booking Confirmed! Dr. ${doctor.lastName} on ${appointmentData.date} at ${appointmentData.time}.`,
                read: false,
                relatedId: appointment._id
            });

            const admins = await User.find({ role: 'Admin' });
            for (const admin of admins) {
                await Notification.create({
                    userId: admin._id,
                    type: 'Appointment',
                    message: `New Booking: ${patient.firstName} with Dr. ${doctor.lastName}`,
                    read: false,
                    relatedId: appointment._id
                });
            }
        } catch (e) { console.error("Notification Error", e); }

        return {
            success: true,
            message: `DONE! I have booked your appointment with Dr. ${doctor.firstName} ${doctor.lastName} for ${appointmentData.date} at ${appointmentData.time}.`,
            details: {
                doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                when: `${appointmentData.date} @ ${appointmentData.time}`
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
            { role: 'system', content: getSystemPrompt(context.user) },
            ...history,
            { role: 'user', content: message }
        ];

        const tools = [
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

            if (fnName === 'getDoctorsInfo') {
                result = await getDoctorsInfo();
            } else if (fnName === 'checkAvailability') {
                result = await getAvailableSlotsForDate(args.date, args.query);
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
                    args.patientData.email = `voice.${Date.now()}@temp.com`;
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

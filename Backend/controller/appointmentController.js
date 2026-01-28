import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { logAdminAction } from "../utils/audit.js";

// Helper: Get available time slots for a doctor on a specific date
export const getAvailableSlots = async (doctorId, date, duration = 30) => {
    try {
        const appointments = await Appointment.find({
            doctorId,
            'appointment.date': date,
            status: { $in: ['Accepted', 'Confirmed', 'Pending'] }
        });

        // Doctor working hours (9 AM to 5 PM by default)
        const doctor = await User.findById(doctorId);
        const workingHours = doctor?.workingHours || { start: '09:00', end: '17:00' };

        const slots = [];
        const [startHour, startMinute] = workingHours.start.split(':').map(Number);
        const [endHour, endMinute] = workingHours.end.split(':').map(Number);
        const slotDuration = duration;

        // Generate all possible slots
        let currentHour = startHour;
        let currentMinute = startMinute;

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            slots.push(timeString);

            // Increment by slot duration
            currentMinute += slotDuration;
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute = currentMinute % 60;
            }
        }

        // Filter out booked slots
        const bookedSlots = appointments.map(apt => {
            const time = apt.appointment?.time;
            // Convert 12-hour format to 24-hour format if needed
            if (time && time.includes(' ')) {
                const [timePart, period] = time.split(' ');
                let [hours, minutes] = timePart.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            return time;
        }).filter(Boolean);

        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

        return availableSlots;
    } catch (error) {
        console.error('Error getting available slots:', error);
        return [];
    }
};

// Helper: Check if doctor is available on a specific date
export const checkDoctorAvailability = async (doctorId, date) => {
    try {
        const doctor = await User.findById(doctorId);
        if (!doctor) return { available: false, reason: 'Doctor not found' };

        // Check if doctor is active
        if (doctor.isActive === false) {
            return { available: false, reason: 'Doctor is currently not available' };
        }

        // Check doctor's schedule
        const day = new Date(date).getDay();
        const availableDays = doctor.availableDays || [1, 2, 3, 4, 5]; // Default: Mon-Fri

        if (!availableDays.includes(day)) {
            return { available: false, reason: 'Doctor not available on this day' };
        }

        // Check number of appointments for that day
        const appointmentsCount = await Appointment.countDocuments({
            doctorId,
            'appointment.date': date,
            status: { $in: ['Accepted', 'Confirmed', 'Pending'] }
        });

        const maxAppointments = doctor.maxAppointmentsPerDay || 8;
        if (appointmentsCount >= maxAppointments) {
            return {
                available: false,
                reason: 'Doctor has reached maximum appointments for this day'
            };
        }

        return { available: true };
    } catch (error) {
        console.error('Error checking doctor availability:', error);
        return { available: false, reason: 'Error checking availability' };
    }
};

// Get available slots for a doctor on a specific date
export const getAvailableAppointmentSlots = catchAsyncErrors(async (req, res, next) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        return next(new ErrorHandler('Doctor ID and date are required', 400));
    }

    try {
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'Doctor') {
            return next(new ErrorHandler('Doctor not found', 404));
        }

        const availability = await checkDoctorAvailability(doctorId, date);
        if (!availability.available) {
            return res.status(200).json({
                success: true,
                available: false,
                message: availability.reason || 'Doctor not available',
                slots: []
            });
        }

        const slots = await getAvailableSlots(doctorId, date);

        // Filter out past slots if date is today
        const today = new Date().toISOString().split('T')[0];
        if (date === today) {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();

            const filteredSlots = slots.filter(slot => {
                const [hours, minutes] = slot.split(':').map(Number);
                if (hours > currentHour) return true;
                if (hours === currentHour && minutes > currentMinute + 30) return true;
                return false;
            });

            return res.status(200).json({
                success: true,
                available: true,
                slots: filteredSlots,
                doctor: {
                    id: doctor._id,
                    name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                    specialization: doctor.specialization || doctor.doctrDptmnt || 'General Physician',
                    workingHours: doctor.workingHours || { start: '09:00', end: '17:00' }
                }
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            slots,
            doctor: {
                id: doctor._id,
                name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialization: doctor.specialization || doctor.doctrDptmnt || 'General Physician',
                workingHours: doctor.workingHours || { start: '09:00', end: '17:00' }
            }
        });

    } catch (error) {
        console.error('Error fetching available slots:', error);
        return next(new ErrorHandler('Failed to fetch available slots', 500));
    }
});

// Get appointment slots for a doctor - SINGLE DEFINITION
export const getAppointmentSlots = catchAsyncErrors(async (req, res, next) => {
    console.log('GET /appointment/slots/:doctorId called');
    console.log('Params:', req.params);
    console.log('Query:', req.query);

    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId) {
        return next(new ErrorHandler('Doctor ID is required', 400));
    }

    if (!date) {
        return next(new ErrorHandler('Date is required', 400));
    }

    try {
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'Doctor') {
            return next(new ErrorHandler('Doctor not found', 404));
        }

        const slots = await getAvailableSlots(doctorId, date);
        const availability = await checkDoctorAvailability(doctorId, date);

        // Convert 24-hour format to 12-hour format for frontend
        const formattedSlots = slots.map(slot => {
            const [hours, minutes] = slot.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        });

        res.status(200).json({
            success: true,
            available: availability.available && slots.length > 0,
            message: availability.available ? 'Slots available' : availability.reason,
            slots: formattedSlots,
            doctor: {
                id: doctor._id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization || doctor.doctrDptmnt || 'General Physician',
                workingHours: doctor.workingHours || { start: '09:00', end: '17:00' },
                consultationDuration: doctor.consultationDuration || 30
            }
        });

    } catch (error) {
        console.error('Error fetching appointment slots:', error);
        return next(new ErrorHandler('Failed to fetch appointment slots', 500));
    }
});

// Create a new appointment with availability check
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    console.log('POST /appointment/post called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? req.user.email : 'No user');

    // Normalize request body - handle different data structures
    let payload = req.body;
    let patientData = {};
    let appointmentData = {};
    let doctorId = null;

    // Handle different payload structures
    if (payload.patient && payload.appointment) {
        patientData = payload.patient;
        appointmentData = payload.appointment;
        doctorId = payload.doctorId || payload.appointment?.doctorId;
    } else {
        patientData = {
            firstName: payload.firstName || req.user?.firstName || '',
            lastName: payload.lastName || req.user?.lastName || '',
            email: payload.email || req.user?.email || '',
            phone: payload.phone || req.user?.phone || '',
            dob: payload.dob || req.user?.dob || '',
            gender: payload.gender || req.user?.gender || ''
        };

        appointmentData = {
            date: payload.appointment_date || payload.date || payload.appointment?.date,
            time: payload.appointment_time || payload.time || payload.appointment?.time,
            department: payload.department || payload.appointment?.department || 'General Physician',
            symptoms: payload.symptoms || payload.appointment?.symptoms || '',
            emergencyContact: payload.emergencyContact || payload.appointment?.emergencyContact || '',
            hasVisited: payload.hasVisited || payload.appointment?.hasVisited || false,
            insuranceProvider: payload.insuranceProvider || payload.insurance || payload.appointment?.insuranceProvider || ''
        };

        doctorId = payload.doctorId || payload.appointment?.doctorId;
    }

    // Validate required fields
    const missingFields = [];
    if (!patientData.firstName) missingFields.push('firstName');
    if (!patientData.lastName) missingFields.push('lastName');
    if (!patientData.email) missingFields.push('email');
    if (!patientData.phone) missingFields.push('phone');
    if (!appointmentData.date) missingFields.push('date');
    if (!appointmentData.time) missingFields.push('time');
    if (!appointmentData.department) missingFields.push('department');

    if (missingFields.length > 0) {
        return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    if (!doctorId) {
        return next(new ErrorHandler('Doctor ID is required', 400));
    }

    // Check doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
        return next(new ErrorHandler('Doctor not found', 404));
    }

    // Convert time to 24-hour format for checking availability
    let time24Format = appointmentData.time;
    if (time24Format.includes(' ')) {
        const [timePart, period] = time24Format.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        time24Format = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Check slot availability
    const availableSlots = await getAvailableSlots(doctorId, appointmentData.date);
    if (!availableSlots.includes(time24Format)) {
        return next(new ErrorHandler('Selected time slot is not available', 400));
    }

    // Check doctor availability
    const availability = await checkDoctorAvailability(doctorId, appointmentData.date);
    if (!availability.available) {
        return next(new ErrorHandler(availability.reason || 'Doctor not available for this date', 400));
    }

    const patientId = req.user?._id;
    if (!patientId) {
        console.log('No patient ID found in request');
        return next(new ErrorHandler('Patient authentication required', 401));
    }

    try {
        const appointment = await Appointment.create({
            patient: patientData,
            appointment: appointmentData,
            doctorId,
            doctor: {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization || doctor.doctrDptmnt || 'General Physician'
            },
            patientId,
            status: "Pending"
        });

        console.log('Appointment created successfully:', appointment._id);

        // Create notifications
        const notifications = [];

        // Notify admins
        const admins = await User.find({ role: 'Admin' });
        notifications.push(...admins.map(admin =>
            Notification.create({
                userId: admin._id,
                title: 'New Appointment Request',
                body: `New appointment requested by ${patientData.firstName} ${patientData.lastName} for ${appointmentData.date} at ${appointmentData.time}`,
                data: {
                    appointmentId: appointment._id,
                    type: 'appointment_created',
                    patientName: `${patientData.firstName} ${patientData.lastName}`,
                    date: appointmentData.date,
                    time: appointmentData.time
                }
            })
        ));

        // Notify patient
        notifications.push(
            Notification.create({
                userId: patientId,
                title: 'Appointment Request Submitted',
                body: `Your appointment request for ${appointmentData.date} at ${appointmentData.time} has been received and is pending confirmation.`,
                data: {
                    appointmentId: appointment._id,
                    type: 'appointment_confirmation',
                    status: 'pending'
                }
            })
        );

        await Promise.all(notifications);
        console.log('Notifications sent successfully');

        res.status(200).json({
            success: true,
            message: 'Appointment submitted successfully! It is now pending confirmation.',
            appointment,
            appointmentNumber: `APT-${appointment._id.toString().substring(18, 24).toUpperCase()}`
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return next(new ErrorHandler('Failed to create appointment: ' + error.message, 500));
    }
});

// Get all appointments (Admin only)
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    console.log('GET /appointment/getall called');

    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            query = { doctorId: req.user._id };
        }

        console.log('Fetching appointments with query:', query);

        const appointments = await Appointment.find(query)
            .populate('doctorId', 'firstName lastName email specialization doctDptmnt')
            .populate('patientId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        console.log(`Found ${appointments.length} appointments`);

        const transformedAppointments = appointments.map(appointment => {
            const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 'Unknown Patient';

            const doctorFirstName = appointment.doctor?.firstName || appointment.doctorId?.firstName || '';
            const doctorLastName = appointment.doctor?.lastName || appointment.doctorId?.lastName || '';
            const doctorName = doctorFirstName ? `Dr. ${doctorFirstName} ${doctorLastName}`.trim() : 'No Doctor Assigned';

            const doctorSpecialization = appointment.doctor?.specialization ||
                appointment.doctorId?.specialization ||
                appointment.doctorId?.doctDptmnt ||
                'General';

            return {
                _id: appointment._id,
                id: appointment._id.toString(),
                patient: {
                    firstName: appointment.patient?.firstName || '',
                    lastName: appointment.patient?.lastName || '',
                    name: patientName,
                    email: appointment.patient?.email || '',
                    phone: appointment.patient?.phone || '',
                    dob: appointment.patient?.dob || '',
                    gender: appointment.patient?.gender || ''
                },
                appointment: {
                    date: appointment.appointment?.date || '',
                    time: appointment.appointment?.time || '',
                    department: appointment.appointment?.department || '',
                    symptoms: appointment.appointment?.symptoms || '',
                    insuranceProvider: appointment.appointment?.insuranceProvider || '',
                    emergencyContact: appointment.appointment?.emergencyContact || '',
                    hasVisited: appointment.appointment?.hasVisited || false
                },
                doctorId: appointment.doctorId,
                doctor: {
                    firstName: doctorFirstName,
                    lastName: doctorLastName,
                    specialization: doctorSpecialization,
                    fullName: doctorName
                },
                patientId: appointment.patientId,
                status: appointment.status || 'Pending',
                createdAt: appointment.createdAt,
                patient_name: patientName,
                patient_phone: appointment.patient?.phone || '',
                patient_email: appointment.patient?.email || '',
                doctorName: doctorName,
                department: appointment.appointment?.department || '',
                date: appointment.appointment?.date || '',
                time: appointment.appointment?.time || '',
                appointment_date: appointment.appointment?.date || '',
                appointment_time: appointment.appointment?.time || '',
                duration: '30 min'
            };
        });

        res.status(200).json({
            success: true,
            appointments: transformedAppointments,
            count: transformedAppointments.length,
            message: `Found ${transformedAppointments.length} appointments`
        });

    } catch (error) {
        console.error('Error fetching appointments:', error);
        // Explicitly return 500 with message to avoid 400 masking
        return next(new ErrorHandler(`Server Error: ${error.message}`, 500));
    }
});

// Update appointment status
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }

    const prevStatus = appointment.status;

    if (req.body.status) {
        const validStatuses = ["Pending", "Accepted", "Rejected", "Cancelled", "Completed"];
        if (!validStatuses.includes(req.body.status)) {
            return next(new ErrorHandler(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
        }
    }

    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (req.body.status && req.body.status !== prevStatus) {
        try {
            const adminMessage = req.body.adminMessage ? String(req.body.adminMessage).trim() : '';
            let notifBody = `Your appointment on ${appointment.appointment?.date || ''} at ${appointment.appointment?.time || ''} is now ${appointment.status}`;

            if (adminMessage) {
                notifBody += ` - Message from admin: ${adminMessage}`;
            }

            if (appointment.status === 'Rejected') {
                notifBody = `Your appointment on ${appointment.appointment?.date || ''} was rejected. ${adminMessage || 'Please choose another slot or contact the hospital.'}`;
            } else if (appointment.status === 'Accepted') {
                notifBody = `Great news! Your appointment on ${appointment.appointment?.date || ''} at ${appointment.appointment?.time || ''} has been confirmed. Please arrive 15 minutes early.`;
            } else if (appointment.status === 'Cancelled') {
                notifBody = `Your appointment on ${appointment.appointment?.date || ''} has been cancelled. ${adminMessage || 'Please book a new appointment if needed.'}`;
            }

            await Notification.create({
                userId: appointment.patientId,
                title: `Appointment ${appointment.status}`,
                body: notifBody,
                data: {
                    appointmentId: appointment._id,
                    type: 'status_update',
                    status: appointment.status,
                    adminMessage,
                    date: appointment.appointment?.date,
                    time: appointment.appointment?.time
                }
            });

            try {
                const adminId = req.user?._id;
                if (adminId) {
                    await logAdminAction({
                        adminId,
                        action: 'update_appointment_status',
                        targetType: 'Appointment',
                        targetId: appointment._id,
                        details: {
                            status: appointment.status,
                            previousStatus: prevStatus,
                            adminMessage: adminMessage || undefined
                        }
                    });
                }
            } catch (e) {
                console.error('Audit log failed:', e);
            }
        } catch (err) {
            console.error('Failed to create notification for status change:', err);
        }
    }

    res.status(200).json({
        success: true,
        message: `Appointment status updated to ${appointment.status}!`,
        appointment
    });
});

// Delete appointment
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'Admin') {
        return next(new ErrorHandler('Admin privileges required', 403));
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }

    await appointment.deleteOne();

    try {
        const adminId = req.user?._id;
        if (adminId) {
            await logAdminAction({
                adminId,
                action: 'delete_appointment',
                targetType: 'Appointment',
                targetId: appointment._id,
                details: {
                    patientName: `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim(),
                    date: appointment.appointment?.date,
                    time: appointment.appointment?.time,
                    department: appointment.appointment?.department,
                    status: appointment.status
                }
            });
        }
    } catch (e) {
        console.error('Audit log failed:', e);
    }

    res.status(200).json({
        success: true,
        message: "Appointment deleted successfully!",
        deletedAppointmentId: id
    });
});

// Get current patient's appointments
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user?._id;
    if (!patientId) return next(new ErrorHandler('Patient authentication required', 401));

    try {
        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'firstName lastName specialization doctDptmnt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            appointments: appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return next(new ErrorHandler('Failed to fetch appointments', 500));
    }
});

// Patient cancels their own appointment
export const cancelAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return next(new ErrorHandler('Appointment not found!', 404));

    const patientId = req.user?._id;
    if (!patientId) return next(new ErrorHandler('Patient authentication required', 401));

    if (String(appointment.patientId) !== String(patientId)) {
        return next(new ErrorHandler('Not authorized to cancel this appointment', 403));
    }

    if (appointment.status === 'Cancelled') {
        return res.status(200).json({
            success: true,
            message: 'Appointment is already cancelled',
            appointment
        });
    }

    appointment.status = 'Cancelled';
    appointment.cancelledAt = Date.now();
    await appointment.save();

    try {
        await Notification.create({
            userId: patientId,
            title: 'Appointment Cancelled',
            body: `You have cancelled your appointment on ${appointment.appointment?.date || ''}.`,
            data: {
                appointmentId: appointment._id,
                type: 'appointment_cancelled',
                cancelledBy: 'patient'
            }
        });

        const admins = await User.find({ role: 'Admin' });
        const adminNotifications = admins.map(admin =>
            Notification.create({
                userId: admin._id,
                title: 'Patient Cancelled Appointment',
                body: `${appointment.patient?.firstName || 'Patient'} cancelled their appointment for ${appointment.appointment?.date || ''}`,
                data: {
                    appointmentId: appointment._id,
                    type: 'appointment_cancelled_by_patient',
                    patientName: `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim()
                }
            })
        );
        await Promise.all(adminNotifications);

    } catch (e) {
        console.error('Notification failed:', e);
    }

    res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment
    });
});

// Admin confirms appointment
export const confirmAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) return next(new ErrorHandler('Appointment not found!', 404));

    appointment.status = 'Accepted';
    appointment.confirmedAt = Date.now();
    await appointment.save();

    try {
        await Notification.create({
            userId: appointment.patientId,
            title: 'Appointment Confirmed!',
            body: `Your appointment on ${appointment.appointment?.date || ''} at ${appointment.appointment?.time || ''} has been confirmed. Please arrive 15 minutes early.`,
            data: {
                appointmentId: appointment._id,
                type: 'appointment_confirmed',
                status: 'Accepted',
                date: appointment.appointment?.date,
                time: appointment.appointment?.time,
                doctor: appointment.doctor?.firstName ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName || ''}` : 'Doctor'
            }
        });

        const adminId = req.user?._id;
        if (adminId) {
            await logAdminAction({
                adminId,
                action: 'confirm_appointment',
                targetType: 'Appointment',
                targetId: appointment._id,
                details: {
                    patientName: `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim(),
                    date: appointment.appointment?.date,
                    time: appointment.appointment?.time,
                    department: appointment.appointment?.department
                }
            });
        }
    } catch (e) {
        console.error('Confirm notification/audit failed:', e);
    }

    res.status(200).json({
        success: true,
        message: 'Appointment confirmed successfully!',
        appointment
    });
});

// Get patient statistics
export const getPatientStats = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user?._id;
    if (!patientId) return next(new ErrorHandler('Patient authentication required', 401));

    try {
        const total = await Appointment.countDocuments({ patientId });
        const pending = await Appointment.countDocuments({ patientId, status: 'Pending' });
        const accepted = await Appointment.countDocuments({ patientId, status: 'Accepted' });
        const confirmed = await Appointment.countDocuments({ patientId, status: { $in: ['Accepted', 'Confirmed'] } });
        const cancelled = await Appointment.countDocuments({ patientId, status: 'Cancelled' });
        const rejected = await Appointment.countDocuments({ patientId, status: 'Rejected' });
        const completed = await Appointment.countDocuments({ patientId, status: 'Completed' });

        const upcoming = await Appointment.countDocuments({
            patientId,
            status: { $nin: ['Cancelled', 'Rejected', 'Completed'] }
        });

        const past = await Appointment.countDocuments({
            patientId,
            status: { $in: ['Completed', 'Cancelled', 'Rejected'] }
        });

        res.status(200).json({
            success: true,
            stats: {
                total,
                pending,
                accepted,
                confirmed,
                cancelled,
                rejected,
                completed,
                upcoming,
                past
            }
        });

    } catch (error) {
        console.error('Error fetching patient stats:', error);
        return next(new ErrorHandler('Failed to fetch statistics', 500));
    }
});

// Get appointment by ID
export const getAppointmentById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Allow patient to view their own appointment, or admin to view any
    let query = { _id: id };
    if (req.user && req.user.role === 'Patient') {
        query.patientId = req.user._id;
    }

    const appointment = await Appointment.findOne(query)
        .populate('doctorId', 'firstName lastName specialization doctDptmnt')
        .populate('patientId', 'firstName lastName email phone');

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found or you are not authorized to view it.", 404));
    }

    res.status(200).json({
        success: true,
        appointment
    });
});

// Check doctor availability for a specific date (Simple boolean check)
export const getDoctorAvailability = catchAsyncErrors(async (req, res, next) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        return next(new ErrorHandler('Doctor ID and Date are required', 400));
    }

    const availability = await checkDoctorAvailability(doctorId, date);

    res.status(200).json({
        success: true,
        available: availability.available,
        reason: availability.reason
    });
});
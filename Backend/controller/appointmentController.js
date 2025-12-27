import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Appointment } from "../models/appointmentSchema.js"
import { User } from "../models/userSchema.js"
import { Notification } from "../models/notificationSchema.js"
import { logAdminAction } from "../utils/audit.js"

// Create a new appointment
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    console.log('POST /appointment called');
    console.log('Request body:', JSON.stringify(req.body).substring(0, 500));
    console.log('User:', req.user ? req.user.email : 'No user');

    const payload = req.body;

    let patientData = payload.patient;
    let appointmentData = payload.appointment;

    // Fallback to flat fields for legacy payloads
    if (!patientData) {
        patientData = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            dob: payload.dob,
            gender: payload.gender,
            aadhar: payload.aadhar
        }
    }
    
    if (!appointmentData) {
        appointmentData = {
            date: payload.appointment_date || payload.date,
            time: payload.appointment_time || payload.time,
            department: payload.department,
            symptoms: payload.symptoms,
            insuranceProvider: payload.insuranceProvider,
            emergencyContact: payload.emergencyContact,
            hasVisited: payload.hasVisited || false
        }
    }

    // Validate required fields
    if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.phone) {
        return next(new ErrorHandler('Missing required patient information', 400));
    }

    if (!appointmentData.date || !appointmentData.time || !appointmentData.department) {
        return next(new ErrorHandler('Missing required appointment details', 400));
    }

    // doctorId preferred, otherwise try to find by name & department
    let doctorId = payload.doctorId;
    let doctorInfo = payload.doctor || {};
    
    if (!doctorId && payload.doctorName) {
        // doctorName may be 'Dr. First Last' or 'First Last'
        const parts = payload.doctorName.replace(/^Dr\.\s*/i, '').split(' ');
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        const found = await User.findOne({ firstName: first, lastName: last, role: 'Doctor' });
        if (found) {
            doctorId = found._id;
            doctorInfo = { 
                firstName: found.firstName, 
                lastName: found.lastName, 
                specialization: found.doctrDptmnt || found.specialization 
            };
        }
    }

    if (doctorId) {
        const found = await User.findById(doctorId);
        if (found) {
            doctorInfo = { 
                firstName: found.firstName, 
                lastName: found.lastName, 
                specialization: found.doctrDptmnt || found.specialization 
            };
        }
    }

    const patientId = req.user?._id || null;
    if (!patientId) {
        console.log('No patient ID found in request');
        return next(new ErrorHandler('Patient authentication required', 401));
    }

    console.log('Creating appointment with:', {
        patientId,
        doctorId,
        doctorInfo,
        patientData: { firstName: patientData.firstName, lastName: patientData.lastName },
        appointmentData: { date: appointmentData.date, time: appointmentData.time, department: appointmentData.department }
    });

    try {
        const appointment = await Appointment.create({
            patient: patientData,
            appointment: appointmentData,
            doctorId,
            doctor: doctorInfo,
            patientId,
            status: "Pending"
        });

        console.log('Appointment created successfully:', appointment._id);

        // Notify all admins about new appointment
        const admins = await User.find({ role: 'Admin' });
        console.log(`Found ${admins.length} admins to notify`);
        
        const notifPromises = admins.map(a => Notification.create({
            userId: a._id,
            title: 'New Appointment Request',
            body: `New appointment requested by ${patientData.firstName} ${patientData.lastName} for ${appointmentData.date} at ${appointmentData.time}`,
            data: { 
                appointmentId: appointment._id, 
                type: 'appointment_created',
                patientName: `${patientData.firstName} ${patientData.lastName}`,
                date: appointmentData.date,
                time: appointmentData.time
            }
        }));
        
        // Notify patient
        notifPromises.push(Notification.create({
            userId: patientId,
            title: 'Appointment Request Submitted',
            body: `Your appointment request for ${appointmentData.date} at ${appointmentData.time} has been received and is pending confirmation.`,
            data: { 
                appointmentId: appointment._id, 
                type: 'appointment_confirmation',
                status: 'pending'
            }
        }));
        
        await Promise.all(notifPromises);
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
    console.log('User making request:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : 'No user');
    
    // Verify admin is authenticated
    if (!req.user) {
        console.log('No user found in request');
        return next(new ErrorHandler('Authentication required', 401));
    }
    
    if (req.user.role !== 'Admin') {
        console.log('User is not admin, role:', req.user.role);
        return next(new ErrorHandler('Admin privileges required to view all appointments', 403));
    }
    
    console.log('Admin authenticated successfully, fetching appointments...');
    
    try {
        const appointments = await Appointment.find()
            .populate('doctorId', 'firstName lastName email specialization doctDptmnt')
            .populate('patientId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${appointments.length} appointments`);
        
        // Transform the data for frontend compatibility
        const transformedAppointments = appointments.map(appointment => {
            const patientFirstName = appointment.patient?.firstName || '';
            const patientLastName = appointment.patient?.lastName || '';
            const patientName = `${patientFirstName} ${patientLastName}`.trim() || 'Unknown Patient';
            
            const doctorFirstName = appointment.doctor?.firstName || appointment.doctorId?.firstName || '';
            const doctorLastName = appointment.doctor?.lastName || appointment.doctorId?.lastName || '';
            const doctorName = doctorFirstName ? `Dr. ${doctorFirstName} ${doctorLastName}`.trim() : 'No Doctor Assigned';
            
            const doctorSpecialization = appointment.doctor?.specialization || 
                                       appointment.doctorId?.specialization || 
                                       appointment.doctorId?.doctDptmnt || 
                                       appointment.doctor?.doctDptmnt || 
                                       'General';
            
            const result = {
                _id: appointment._id,
                id: appointment._id.toString(),
                patient: {
                    firstName: patientFirstName,
                    lastName: patientLastName,
                    name: patientName,
                    email: appointment.patient?.email || '',
                    phone: appointment.patient?.phone || '',
                    dob: appointment.patient?.dob || '',
                    gender: appointment.patient?.gender || '',
                    aadhar: appointment.patient?.aadhar || ''
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
                confirmedAt: appointment.confirmedAt,
                cancelledAt: appointment.cancelledAt,
                // Legacy/compatibility fields
                patient_name: patientName,
                patient_phone: appointment.patient?.phone || '',
                patient_email: appointment.patient?.email || '',
                doctorName: doctorName,
                department: appointment.appointment?.department || '',
                date: appointment.appointment?.date || '',
                time: appointment.appointment?.time || '',
                appointment_date: appointment.appointment?.date || '',
                appointment_time: appointment.appointment?.time || '',
                duration: '30 min', // Default duration
                raw: appointment // Include raw data for debugging
            };
            
            return result;
        });

        console.log('Sending appointments response');
        
        res.status(200).json({
            success: true,
            appointments: transformedAppointments,
            count: transformedAppointments.length,
            message: `Found ${transformedAppointments.length} appointments`
        });
        
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return next(new ErrorHandler('Failed to fetch appointments: ' + error.message, 500));
    }
});

// Update appointment status
export const updateAppointmentStatus = catchAsyncErrors(async (req,res,next)=>{
    console.log('PUT /appointment/update/:id called');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('User:', req.user ? req.user.email : 'No user');

    const {id} = req.params;
    
    if (!req.user || req.user.role !== 'Admin') {
        return next(new ErrorHandler('Admin privileges required', 403));
    }

    let appointment = await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    
    const prevStatus = appointment.status;
    
    // Validate status if provided
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

    // If status changed, notify patient
    if (req.body.status && req.body.status !== prevStatus) {
        try {
            const adminMessage = req.body.adminMessage ? String(req.body.adminMessage).trim() : '';
            let notifBody = `Your appointment on ${appointment.appointment?.date || ''} at ${appointment.appointment?.time || ''} is now ${appointment.status}`;
            
            if (adminMessage) {
                notifBody += ` - Message from admin: ${adminMessage}`;
            }
            
            // Custom messages for specific statuses
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
            
            // Audit log
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
export const deleteAppointment = catchAsyncErrors(async(req,res,next)=>{
    console.log('DELETE /appointment/delete/:id called');
    console.log('Params:', req.params);
    console.log('User:', req.user ? req.user.email : 'No user');

    const {id} = req.params;
    
    if (!req.user || req.user.role !== 'Admin') {
        return next(new ErrorHandler('Admin privileges required', 403));
    }

    let appointment = await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("Appointment not found!", 404));
    }

    await appointment.deleteOne();
    
    // Audit log
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
    console.log('GET /appointment/me called');
    console.log('User:', req.user ? req.user.email : 'No user');

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
    console.log('PUT /appointment/cancel/:id called');
    console.log('Params:', req.params);
    console.log('User:', req.user ? req.user.email : 'No user');

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
        
        // Notify admins about cancellation
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
    console.log('PUT /appointment/confirm/:id called');
    console.log('Params:', req.params);
    console.log('User:', req.user ? req.user.email : 'No user');

    const { id } = req.params;
    
    if (!req.user || req.user.role !== 'Admin') {
        return next(new ErrorHandler('Admin privileges required', 403));
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) return next(new ErrorHandler('Appointment not found!', 404));

    // Update appointment
    appointment.status = 'Accepted';
    appointment.confirmedAt = Date.now();
    await appointment.save();

    try {
        // Notify patient
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
        
        // Audit log
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
    console.log('GET /appointment/stats/me called');
    console.log('User:', req.user ? req.user.email : 'No user');

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
    console.log('GET /appointment/:id called');
    console.log('Params:', req.params);
    console.log('User:', req.user ? req.user.email : 'No user');

    const { id } = req.params;
    
    try {
        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'firstName lastName email specialization doctDptmnt phone')
            .populate('patientId', 'firstName lastName email phone');
        
        if (!appointment) {
            return next(new ErrorHandler('Appointment not found', 404));
        }
        
        // Check authorization
        const isAdmin = req.user && req.user.role === 'Admin';
        const isPatient = req.user && String(req.user._id) === String(appointment.patientId);
        const isDoctor = req.user && String(req.user._id) === String(appointment.doctorId);
        
        if (!isAdmin && !isPatient && !isDoctor) {
            return next(new ErrorHandler('Not authorized to view this appointment', 403));
        }
        
        res.status(200).json({
            success: true,
            appointment
        });
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        return next(new ErrorHandler('Failed to fetch appointment', 500));
    }
});
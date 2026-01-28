import express from "express"
import {
    deleteAppointment,
    getAllAppointments,
    postAppointment,
    updateAppointmentStatus,
    getMyAppointments,
    cancelAppointment,
    confirmAppointment,
    getPatientStats,
    getAvailableAppointmentSlots,
    getDoctorAvailability,
    getAppointmentSlots,  // NEW FUNCTION - Add to controller
    getAppointmentById     // NEW FUNCTION - Add to controller
} from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isAdminOrDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.get("/available-slots", getAvailableAppointmentSlots);
router.get("/doctor-availability", getDoctorAvailability);
router.get("/slots/:doctorId", getAppointmentSlots); // NEW ROUTE

// ================= ADMIN/DOCTOR ROUTES =================
router.get("/getall", isAdminOrDoctorAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminOrDoctorAuthenticated, updateAppointmentStatus);
router.put("/confirm/:id", isAdminOrDoctorAuthenticated, confirmAppointment);

// ================= PATIENT ROUTES (Specific stats/me first) =================
router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/me", isPatientAuthenticated, getMyAppointments);
router.get("/stats/me", isPatientAuthenticated, getPatientStats);
router.put("/cancel/:id", isPatientAuthenticated, cancelAppointment);

// ================= GENERIC ID ROUTES (Must be last) =================
router.get("/:id", getAppointmentById);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
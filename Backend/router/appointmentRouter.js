import express from "express"
import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus, getMyAppointments, cancelAppointment, confirmAppointment, getPatientStats } from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();


router.post("/post",isPatientAuthenticated, postAppointment)
router.get("/getall",isAdminAuthenticated, getAllAppointments)
router.put("/update/:id",isAdminAuthenticated, updateAppointmentStatus)
router.delete("/delete/:id",isAdminAuthenticated, deleteAppointment)
router.get("/me", isPatientAuthenticated, getMyAppointments)
router.put("/cancel/:id", isPatientAuthenticated, cancelAppointment)
router.put("/confirm/:id", isAdminAuthenticated, confirmAppointment)
router.get("/stats/me", isPatientAuthenticated, getPatientStats)

export default router;

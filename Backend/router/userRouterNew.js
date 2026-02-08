import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors, // Make sure this is imported
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
  initAdmin,
  devBootstrap,
  checkInitialAdmin,
  logoutDoctor,
} from "../controller/userController.js";
import { importPatients, getImportTemplate } from "../controller/patientDataController.js";

import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated, isAdminOrDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.post("/patient/register", patientRegister);
router.post("/login", login);
router.get("/admin/check", checkInitialAdmin);
router.post("/admin/init", initAdmin);
router.get("/doctors", getAllDoctors); // This route must exist
router.get("/alldoctors", getAllDoctors); // Alias for compatibility

// ================= ADMIN CREATION ROUTE =================
router.post("/admin/addnew", addNewAdmin);

// ================= PROTECTED ROUTES =================
// General status
router.get("/me", isAdminOrDoctorAuthenticated, getUserDetails);

// Admin routes
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.post("/patient/import", isAdminAuthenticated, importPatients);
router.get("/patient/import/template", isAdminAuthenticated, getImportTemplate);

// Patient routes
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// Doctor routes
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);

// ================= ADMIN ONLY =================
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// ================= DEV =================
if (process.env.NODE_ENV !== "production") {
  router.post("/dev/bootstrap", devBootstrap);
}

export default router;
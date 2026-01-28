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
} from "../controller/userController.js";

import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

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
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// ================= ADMIN ONLY =================
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// ================= DEV =================
if (process.env.NODE_ENV !== "production") {
  router.post("/dev/bootstrap", devBootstrap);
}

export default router;
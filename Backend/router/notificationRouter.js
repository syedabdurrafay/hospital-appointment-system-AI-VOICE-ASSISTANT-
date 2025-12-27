import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  getAllNotifications,
} from '../controller/notificationController.js';
import { isAdminAuthenticated, isPatientAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', isAdminAuthenticated, createNotification); // only admin can create arbitrary notifications
router.get('/me', isPatientAuthenticated, getUserNotifications);
router.put('/read/:id', isPatientAuthenticated, markAsRead);
router.get('/getall', isAdminAuthenticated, getAllNotifications);

export default router;

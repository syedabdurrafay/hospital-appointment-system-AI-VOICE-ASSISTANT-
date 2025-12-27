import express from 'express';
import { getAllAudits, getMyAudits } from '../controller/auditController.js';
import { isAdminAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/getall', isAdminAuthenticated, getAllAudits);
router.get('/me', isAdminAuthenticated, getMyAudits);

export default router;

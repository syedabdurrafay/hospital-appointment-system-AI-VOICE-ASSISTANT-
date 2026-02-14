import express from "express";
import { chatWithAI, processVoiceAssistant } from "../controller/aiController.js";

const router = express.Router();

// POST /api/v1/ai/chat - Chat with AI assistant
router.post("/chat", chatWithAI);

// POST /api/v1/ai/process-voice - Process voice assistant request via Python
router.post("/process-voice", processVoiceAssistant);

export default router;

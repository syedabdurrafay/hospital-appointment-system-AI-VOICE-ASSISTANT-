import express from "express";
import { chatWithAI } from "../controller/aiController.js";

const router = express.Router();

// POST /api/v1/ai/chat - Chat with AI assistant
router.post("/chat", chatWithAI);

export default router;

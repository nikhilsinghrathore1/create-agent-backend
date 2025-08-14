import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';

const router = Router();

// POST /chat - Generate chat response using Gemini API
router.post('/', chatController.chat.bind(chatController));

// POST /chat/stream - Generate streaming chat response (bonus endpoint)
router.post('/stream', chatController.streamChat.bind(chatController));

export { router as chatRouter };

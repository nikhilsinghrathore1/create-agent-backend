import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { agentsRouter } from './routes/agents.js';
import { chatRouter } from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/agents', agentsRouter);
app.use('/chat', chatRouter);

// Health check endpoint
app.get('/health', (req, res) => {
               res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
               res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
               console.log(`🚀 Server running on port ${PORT}`);
               console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
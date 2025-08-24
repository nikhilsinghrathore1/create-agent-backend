import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash',
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            }
        });
        
        // Store chat sessions by sessionId
        this.chatSessions = new Map();
        
        // Default system instruction
        this.systemInstruction = "You are a helpful AI assistant. Provide clear, accurate, and contextual responses based on the conversation history.";
    }

    /**
     * Create or get a chat session for a specific user/session
     * @param {string} sessionId - Unique identifier for the chat session
     * @param {string} systemInstruction - Optional system instruction for the session
     * @returns {Object} Chat session object
     */
    getOrCreateChatSession(sessionId, systemInstruction = null) {
        if (!this.chatSessions.has(sessionId)) {
            const chatSession = this.model.startChat({
                history: [],
                systemInstruction: systemInstruction || this.systemInstruction
            });
            
            this.chatSessions.set(sessionId, {
                chat: chatSession,
                history: [],
                createdAt: new Date(),
                lastUsed: new Date()
            });
        } else {
            // Update last used timestamp
            this.chatSessions.get(sessionId).lastUsed = new Date();
        }
        
        return this.chatSessions.get(sessionId);
    }

    /**
     * Generate response with chat history context
     * @param {string} prompt - User's message
     * @param {string} sessionId - Session identifier (default: 'default')
     * @param {string} systemInstruction - Optional system instruction
     * @returns {Promise<string>} Generated response
     */
    async generateResponse(prompt, sessionId = 'default', systemInstruction = null) {
        try {
            const session = this.getOrCreateChatSession(sessionId, systemInstruction);
            
            // Send message to the chat session (maintains history automatically)
            const result = await session.chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) {
                throw new Error('Empty response from Gemini API');
            }

            // Store in our local history for reference
            session.history.push(
                { role: 'user', parts: [{ text: prompt }], timestamp: new Date() },
                { role: 'model', parts: [{ text: text }], timestamp: new Date() }
            );

            return text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate response from Gemini API');
        }
    }

    /**
     * Generate streaming response with chat history context
     * @param {string} prompt - User's message
     * @param {string} sessionId - Session identifier (default: 'default')
     * @param {string} systemInstruction - Optional system instruction
     * @returns {Promise<ReadableStream>} Streaming response
     */
    async generateStreamResponse(prompt, sessionId = 'default', systemInstruction = null) {
        try {
            const session = this.getOrCreateChatSession(sessionId, systemInstruction);
            
            // Send message to the chat session with streaming
            const result = await session.chat.sendMessageStream(prompt);
            
            // Store user message in history immediately
            session.history.push({
                role: 'user',
                parts: [{ text: prompt }],
                timestamp: new Date()
            });
            
            // We'll need to collect the streamed response to store it in history
            const originalStream = result.stream;
            let fullResponse = '';
            
            // Create a new readable stream that collects the response
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of originalStream) {
                            const chunkText = chunk.text();
                            fullResponse += chunkText;
                            controller.enqueue(chunk);
                        }
                        
                        // Store the complete response in history
                        session.history.push({
                            role: 'model',
                            parts: [{ text: fullResponse }],
                            timestamp: new Date()
                        });
                        
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                }
            });
            
            return stream;
        } catch (error) {
            console.error('Gemini API streaming error:', error);
            throw new Error('Failed to generate streaming response from Gemini API');
        }
    }

    /**
     * Get chat history for a session
     * @param {string} sessionId - Session identifier
     * @returns {Array} Chat history array
     */
    getChatHistory(sessionId) {
        const session = this.chatSessions.get(sessionId);
        return session ? session.history : [];
    }

    /**
     * Clear chat history for a session
     * @param {string} sessionId - Session identifier
     */
    clearChatHistory(sessionId) {
        if (this.chatSessions.has(sessionId)) {
            this.chatSessions.delete(sessionId);
        }
    }

    /**
     * Get all active sessions
     * @returns {Array} Array of session information
     */
    getActiveSessions() {
        return Array.from(this.chatSessions.entries()).map(([id, session]) => ({
            sessionId: id,
            messageCount: session.history.length,
            createdAt: session.createdAt,
            lastUsed: session.lastUsed
        }));
    }

    /**
     * Clean up old sessions (older than specified hours)
     * @param {number} hoursThreshold - Hours after which to remove inactive sessions
     */
    cleanupOldSessions(hoursThreshold = 24) {
        const now = new Date();
        const threshold = hoursThreshold * 60 * 60 * 1000; // Convert to milliseconds
        
        for (const [sessionId, session] of this.chatSessions.entries()) {
            if (now - session.lastUsed > threshold) {
                this.chatSessions.delete(sessionId);
                console.log(`Cleaned up session: ${sessionId}`);
            }
        }
    }

    /**
     * Export chat history for a session (useful for backup/analysis)
     * @param {string} sessionId - Session identifier
     * @returns {Object} Exportable session data
     */
    exportSessionData(sessionId) {
        const session = this.chatSessions.get(sessionId);
        if (!session) {
            return null;
        }

        return {
            sessionId,
            history: session.history,
            createdAt: session.createdAt,
            lastUsed: session.lastUsed,
            messageCount: session.history.length
        };
    }

    /**
     * Import chat history for a session
     * @param {Object} sessionData - Previously exported session data
     */
    importSessionData(sessionData) {
        if (!sessionData || !sessionData.sessionId) {
            throw new Error('Invalid session data');
        }

        // Create new chat session and populate with history
        const chatSession = this.model.startChat({
            history: sessionData.history.map(msg => ({
                role: msg.role,
                parts: msg.parts
            }))
        });

        this.chatSessions.set(sessionData.sessionId, {
            chat: chatSession,
            history: sessionData.history,
            createdAt: new Date(sessionData.createdAt),
            lastUsed: new Date()
        });
    }
}

export const geminiService = new GeminiService();

setInterval(() => {
    geminiService.cleanupOldSessions(24); // Clean sessions older than 24 hours
}, 60 * 60 * 1000); // Run every hour
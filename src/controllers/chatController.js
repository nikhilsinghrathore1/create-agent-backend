import { geminiService } from '../services/geminiService.js';
import { z } from 'zod';

const chatRequestSchema = z.object({
               prompt: z.string().min(1).max(4000),
});

export class ChatController {
               async chat(req, res) {
                              try {
                                             const { prompt } = chatRequestSchema.parse(req.body);

                                             const response = await geminiService.generateResponse(prompt);

                                             res.json({
                                                            success: true,
                                                            data: {
                                                                           prompt,
                                                                           response,
                                                                           timestamp: new Date().toISOString()
                                                            }
                                             });
                              } catch (error) {
                                             if (error instanceof z.ZodError) {
                                                            res.status(400).json({
                                                                           success: false,
                                                                           error: 'Validation error',
                                                                           details: error.errors
                                                            });
                                                            return;
                                             }

                                             console.error('Chat error:', error);
                                             res.status(500).json({
                                                            success: false,
                                                            error: 'Failed to generate chat response'
                                             });
                              }
               }

               async streamChat(req, res) {
                              try {
                                             const { prompt } = chatRequestSchema.parse(req.body);

                                             res.setHeader('Content-Type', 'text/plain');
                                             res.setHeader('Transfer-Encoding', 'chunked');

                                             const stream = await geminiService.generateStreamResponse(prompt);

                                             for await (const chunk of stream) {
                                                            const chunkText = chunk.text();
                                                            res.write(chunkText);
                                             }

                                             res.end();
                              } catch (error) {
                                             if (error instanceof z.ZodError) {
                                                            res.status(400).json({
                                                                           success: false,
                                                                           error: 'Validation error',
                                                                           details: error.errors
                                                            });
                                                            return;
                                             }

                                             console.error('Stream chat error:', error);
                                             res.status(500).json({
                                                            success: false,
                                                            error: 'Failed to generate streaming chat response'
                                             });
                              }
               }
}

export const chatController = new ChatController();

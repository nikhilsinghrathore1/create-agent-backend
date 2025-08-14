import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
               throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
               constructor() {
                              this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
               }

               async generateResponse(prompt) {
                              try {
                                             const result = await this.model.generateContent(prompt);
                                             const response = await result.response;
                                             const text = response.text();

                                             if (!text) {
                                                            throw new Error('Empty response from Gemini API');
                                             }

                                             return text;
                              } catch (error) {
                                             console.error('Gemini API error:', error);
                                             throw new Error('Failed to generate response from Gemini API');
                              }
               }

               async generateStreamResponse(prompt) {
                              try {
                                             const result = await this.model.generateContentStream(prompt);
                                             return result.stream;
                              } catch (error) {
                                             console.error('Gemini API streaming error:', error);
                                             throw new Error('Failed to generate streaming response from Gemini API');
                              }
               }
}

export const geminiService = new GeminiService();

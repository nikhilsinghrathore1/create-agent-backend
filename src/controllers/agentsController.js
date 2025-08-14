import { db } from '../database/connection.js';
import { agents, insertAgentSchema } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export class AgentsController {
               async createAgent(req, res) {
                              try {
                                             const validatedData = insertAgentSchema.parse(req.body);

                                             const [newAgent] = await db
                                                            .insert(agents)
                                                            .values({
                                                                           ...validatedData,
                                                                           createdAt: new Date(),
                                                                           updatedAt: new Date(),
                                                            })
                                                            .returning();

                                             res.status(201).json({
                                                            success: true,
                                                            data: newAgent,
                                                            message: 'Agent created successfully'
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

                                             console.error('Create agent error:', error);
                                             res.status(500).json({
                                                            success: false,
                                                            error: 'Failed to create agent'
                                             });
                              }
               }

               async getAgentById(req, res) {
                              try {
                                             const agentId = parseInt(req.params.id);

                                             if (isNaN(agentId)) {
                                                            res.status(400).json({
                                                                           success: false,
                                                                           error: 'Invalid agent ID'
                                                            });
                                                            return;
                                             }

                                             const [agent] = await db
                                                            .select()
                                                            .from(agents)
                                                            .where(eq(agents.id, agentId))
                                                            .limit(1);

                                             if (!agent) {
                                                            res.status(404).json({
                                                                           success: false,
                                                                           error: 'Agent not found'
                                                            });
                                                            return;
                                             }

                                             res.json({
                                                            success: true,
                                                            data: agent
                                             });
                              } catch (error) {
                                             console.error('Get agent error:', error);
                                             res.status(500).json({
                                                            success: false,
                                                            error: 'Failed to fetch agent'
                                             });
                              }
               }

               async getAllAgents(req, res) {
                              try {
                                             const allAgents = await db.select().from(agents);

                                             res.json({
                                                            success: true,
                                                            data: allAgents,
                                                            count: allAgents.length
                                             });
                              } catch (error) {
                                             console.error('Get all agents error:', error);
                                             res.status(500).json({
                                                            success: false,
                                                            error: 'Failed to fetch agents'
                                             });
                              }
               }
}

export const agentsController = new AgentsController();

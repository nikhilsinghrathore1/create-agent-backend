import { Router } from 'express';
import { agentsController } from '../controllers/agentsController.js';

const router = Router();

// POST /agents - Create an AI agent
router.post('/', agentsController.createAgent.bind(agentsController));

// GET /agents/:id - Get agent by ID
router.get('/:id', agentsController.getAgentById.bind(agentsController));

// GET /agents - Get all agents (bonus endpoint)
router.get('/', agentsController.getAllAgents.bind(agentsController));

export { router as agentsRouter };

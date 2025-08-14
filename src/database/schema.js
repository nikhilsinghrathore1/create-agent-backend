import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const agents = pgTable('agents', {
               id: serial('id').primaryKey(),
               name: text('name').notNull(),
               description: text('description').notNull(),
               model: text('model').notNull(),
               capabilities: jsonb('capabilities').notNull(),
               createdAt: timestamp('created_at').defaultNow().notNull(),
               updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertAgentSchema = z.object({
               name: z.string().min(1).max(255),
               description: z.string().min(1).max(1000),
               model: z.string().min(1).max(100),
               capabilities: z.array(z.string()).min(1),
});

export const selectAgentSchema = z.object({
               id: z.number(),
               name: z.string(),
               description: z.string(),
               model: z.string(),
               capabilities: z.array(z.string()),
               createdAt: z.date(),
               updatedAt: z.date(),
});

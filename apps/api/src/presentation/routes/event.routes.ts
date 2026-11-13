import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../infrastructure/database/client';
import { events } from '../../infrastructure/database/schema/event.table';
import { randomUUID } from 'node:crypto';

export async function eventRoutes(app: FastifyInstance): Promise<void> {
  
  // GET : Lister les événements
  app.get('/events', async (req, reply) => {
    const q = z.object({ 
      churchId: z.string().uuid(), 
      upcoming: z.string().optional() 
    }).parse(req.query);
    
    const list = await db.select().from(events).where(eq(events.churchId, q.churchId));
    
    // Filtrer les événements à venir si demandé
    if (q.upcoming === 'true') {
      const now = new Date();
      return reply.send(list.filter(e => new Date(e.startDate) >= now && e.status !== 'CANCELLED'));
    }
    
    return reply.send(list);
  });

  // POST : Créer un événement
  app.post('/events', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = z.object({
      churchId: z.string().uuid(),
      title: z.string().min(2),
      description: z.string().optional().nullable(),
      startDate: z.string(),
      endDate: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      coverImageUrl: z.string().optional().nullable()
    }).parse(req.body);

    const id = randomUUID();
    const now = new Date();

    await db.insert(events).values({
      id,
      churchId: body.churchId,
      title: body.title,
      description: body.description || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      coverImageUrl: body.coverImageUrl || null,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now
    });

    return reply.status(201).send({ id });
  });

  // PUT : Modifier ou suspendre un événement
  app.put('/events/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional().nullable(),
      startDate: z.string().optional(),
      endDate: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      coverImageUrl: z.string().optional().nullable(),
      status: z.string().optional()
    }).parse(req.body);

    const updateData: any = { ...body, updatedAt: new Date() };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    await db.update(events).set(updateData).where(eq(events.id, id));
    
    return reply.status(200).send({ success: true });
  });

  // DELETE : Supprimer un événement
  app.delete('/events/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.delete(events).where(eq(events.id, id));
    return reply.status(204).send();
  });
}

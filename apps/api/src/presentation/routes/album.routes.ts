import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../infrastructure/database/client';
import { albums } from '../../infrastructure/database/schema/album.table';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function albumRoutes(app: FastifyInstance): Promise<void> {
  
  // GET : Lister tous les albums (public)
  app.get('/albums', async (req, reply) => {
    const q = z.object({ churchId: z.string().uuid() }).parse(req.query);
    const list = await db.select().from(albums).where(eq(albums.churchId, q.churchId)).orderBy(desc(albums.createdAt));
    return reply.send(list);
  });

  // POST : Créer un album (Admin)
  app.post('/albums', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const body = z.object({
      churchId: z.string().uuid(),
      title: z.string().min(2),
      description: z.string().optional(),
      images: z.array(z.string()).default([])
    }).parse(req.body);

    const now = new Date();
    const id = randomUUID();
    await db.insert(albums).values({
      id,
      churchId: body.churchId,
      title: body.title,
      description: body.description || null,
      images: body.images,
      createdAt: now,
      updatedAt: now
    });

    return reply.status(201).send({ id });
  });

  // PUT : Modifier un album (Admin)
  app.put('/albums/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      title: z.string().min(2).optional(),
      description: z.string().nullable().optional(),
      images: z.array(z.string()).optional()
    }).parse(req.body);

    await db.update(albums).set({
      ...body,
      updatedAt: new Date()
    }).where(eq(albums.id, id));

    return reply.send({ success: true });
  });

  // DELETE : Supprimer un album (Admin)
  app.delete('/albums/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.delete(albums).where(eq(albums.id, id));
    return reply.status(204).send();
  });
}

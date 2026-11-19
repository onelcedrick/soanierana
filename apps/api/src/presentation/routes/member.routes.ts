import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../infrastructure/database/client';
import { members } from '../../infrastructure/database/schema/member.table';
import { randomUUID } from 'node:crypto';

const SUPER_ADMIN_EMAIL = 'admin@soanierana.com';

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  app.get('/members', async (req, reply) => {
    const q = z.object({ churchId: z.string().uuid() }).parse(req.query);
    const list = await db.select().from(members).where(eq(members.churchId, q.churchId));
    return reply.send(list);
  });

  app.post('/members', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = z.object({
      churchId: z.string().uuid(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
      photoUrl: z.string().optional().nullable(),
      membershipStatus: z.string(),
      responsibilityLevel: z.string(),
    }).parse(req.body);

    const id = randomUUID();
    const now = new Date();

    await db.insert(members).values({
      id,
      churchId: body.churchId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      photoUrl: body.photoUrl || null,
      membershipStatus: body.membershipStatus,
      responsibilityLevel: body.responsibilityLevel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({ id });
  });

  app.put('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser;
    if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return reply.status(403).send({ error: "Seul le super administrateur peut modifier un membre." });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      photoUrl: z.string().optional().nullable(),
      membershipStatus: z.string().optional(),
      responsibilityLevel: z.string().optional(),
    }).parse(req.body);

    await db.update(members).set({ ...body, updatedAt: new Date() }).where(eq(members.id, id));
    return reply.send({ success: true });
  });

  app.delete('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser;
    if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return reply.status(403).send({ error: "Seul le super administrateur peut supprimer un membre." });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.delete(members).where(eq(members.id, id));
    return reply.status(204).send();
  });
}

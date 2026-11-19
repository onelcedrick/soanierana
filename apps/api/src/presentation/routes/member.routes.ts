import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../infrastructure/database/client';
import { members } from '../../infrastructure/database/schema/member.table';
import { randomUUID } from 'node:crypto';

// Le compte super admin autorisé à modifier/supprimer
const SUPER_ADMIN_EMAIL = 'admin@soanierana.com';

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  
  // GET : Lister les membres
  app.get('/members', async (req, reply) => {
    const q = z.object({ churchId: z.string().uuid() }).parse(req.query);
    const list = await db.select().from(members).where(eq(members.churchId, q.churchId));
    return reply.send(list);
  });

  // POST : Ajouter un membre
  app.post('/members', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = z.object({
      churchId: z.string().uuid(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
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
      membershipStatus: body.membershipStatus,
      responsibilityLevel: body.responsibilityLevel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({ id });
  });

  // PUT : Modifier un membre (Réservé au Super Admin)
  app.put('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser;
    
    // 🚨 VÉRIFICATION STRICTE : Seul admin@soanierana.com peut modifier
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return reply.status(403).send({ error: "Seul le super administrateur peut modifier un membre." });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      membershipStatus: z.string().optional(),
      responsibilityLevel: z.string().optional(),
    }).parse(req.body);

    await db.update(members).set({ ...body, updatedAt: new Date() }).where(eq(members.id, id));
    return reply.send({ success: true });
  });

  // DELETE : Supprimer un membre (Réservé au Super Admin)
  app.delete('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser;
    
    // 🚨 VÉRIFICATION STRICTE
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return reply.status(403).send({ error: "Seul le super administrateur peut supprimer un membre." });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.delete(members).where(eq(members.id, id));
    return reply.status(204).send();
  });
}

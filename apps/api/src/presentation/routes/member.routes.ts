import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../infrastructure/database/client';
import { members } from '../../infrastructure/database/schema/member.table';
import { users } from '../../infrastructure/database/schema/user.table';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';

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

  // PUT : Modifier un membre
  app.put('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
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

  // DELETE : Supprimer un membre
  app.delete('/members/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.delete(members).where(eq(members.id, id));
    return reply.status(204).send();
  });

  // 👇 POST : Créer un compte utilisateur pour un membre (Admin)
  app.post('/members/:id/create-account', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { password } = z.object({ password: z.string().min(8) }).parse(req.body);

    const memberRes = await db.select().from(members).where(eq(members.id, id)).limit(1);
    const member = memberRes[0];
    if (!member) return reply.status(404).send({ error: "Membre introuvable" });
    if (!member.email) return reply.status(400).send({ error: "Le membre n'a pas d'adresse email." });

    const existingUser = await db.select().from(users).where(eq(users.email, member.email)).limit(1);
    if (existingUser.length > 0) {
      return reply.status(400).send({ error: "Un compte existe déjà pour cet email." });
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id: userId,
      churchId: member.churchId,
      memberId: member.id,
      email: member.email,
      passwordHash: hash,
      role: 'MEMBER',
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    return reply.status(201).send({ success: true, userId });
  });
}

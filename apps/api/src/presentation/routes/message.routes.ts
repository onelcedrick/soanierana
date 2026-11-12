import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Message } from '../../domain/message/message';
import { db } from '../../infrastructure/database/client';
import { messages } from '../../infrastructure/database/schema/message.table';
import { members } from '../../infrastructure/database/schema/member.table';
import { eq, desc } from 'drizzle-orm';

export async function messageRoutes(app: FastifyInstance): Promise<void> {
  app.post('/messages', { preHandler: [app.authenticate] }, async (req, reply) => {
    try {
      const body = z.object({
        subject: z.string().min(2),
        content: z.string().min(2),
        isAnonymous: z.boolean().optional().default(false),
      }).parse(req.body);

      const user = req.currentUser!;
      let senderName = 'Inconnu';

      if (body.isAnonymous) {
        senderName = 'Anonyme';
      } else {
        // Si ce n'est pas anonyme, on cherche le vrai nom du membre
        if (user.memberId) {
          const [member] = await db.select().from(members).where(eq(members.id, user.memberId)).limit(1);
          if (member) {
            senderName = `${member.firstName} ${member.lastName}`;
          }
        } else {
          senderName = user.role === 'ADMIN' ? 'Administrateur' : 'Membre';
        }
      }
      
      const msg = Message.create({
        churchId: user.churchId,
        senderId: user.sub,
        senderName: senderName, // <-- On utilise le vrai nom ici
        subject: body.subject,
        content: body.content,
        isAnonymous: body.isAnonymous,
      });

      await db.insert(messages).values({
        id: msg.id, churchId: msg.churchId, senderId: msg.senderId,
        senderName: msg.senderName, subject: msg.subject, content: msg.content,
        isAnonymous: msg.isAnonymous, isRead: msg.isRead, createdAt: msg.createdAt,
      });
      
      return reply.status(201).send({ id: msg.id });
    } catch (err) {
      req.log.error(err, 'Erreur envoi message');
      return reply.status(500).send({ error: 'Erreur serveur' });
    }
  });

  app.get('/messages', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    try {
      const user = req.currentUser!;
      const list = await db.select().from(messages)
        .where(eq(messages.churchId, user.churchId))
        .orderBy(desc(messages.createdAt));
      return reply.send(list);
    } catch (err) {
      req.log.error(err, 'Erreur chargement messages');
      return reply.status(500).send({ error: 'Erreur serveur' });
    }
  });

  app.patch('/messages/:id/read', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
      return reply.send({ success: true });
    } catch (err) {
      return reply.status(500).send({ error: 'Erreur serveur' });
    }
  });
}

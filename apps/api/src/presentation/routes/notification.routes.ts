import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Container } from '../container';

const NotifyBody = z.object({
  userId: z.string().uuid(),
  kind: z.enum(['ASSIGNMENT_PROPOSED', 'ASSIGNMENT_RESPONSE', 'REPLACEMENT_REQUEST', 'REPLACEMENT_DECIDED', 'PUBLICATION_PUBLISHED', 'POLL_PUBLISHED']),
  title: z.string().min(2),
  body: z.string().min(2),
});

export async function notificationRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  app.get('/notifications', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser!;
    const list = await opts.container.notificationRepository.findByUser(user.sub);
    return reply.status(200).send(list.map((n) => ({
      id: n.id, kind: n.kind, title: n.title, body: n.body, isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })));
  });

  app.post('/notifications', { preHandler: [app.authorize('ADMIN', 'RESPONSABLE')] }, async (req, reply) => {
    const body = NotifyBody.parse(req.body);
    const n = await opts.container.notifyUseCase.execute(body);
    return reply.status(201).send(n);
  });
}

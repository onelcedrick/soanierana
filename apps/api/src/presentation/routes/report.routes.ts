import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Container } from '../container';

const Query = z.object({ churchId: z.string().uuid() });

export async function reportRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  app.get('/reports/analytics', { preHandler: [app.authorize('ADMIN', 'RESPONSABLE')] }, async (req, reply) => {
    const { churchId } = Query.parse(req.query);
    return reply.send(await opts.container.getAnalyticsUseCase.execute(churchId));
  });
}

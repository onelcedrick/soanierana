import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Container } from '../container';

const Query = z.object({
  churchId: z.string().uuid(),
  page: z.coerce.number().min(1).optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
});

export async function auditRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  app.get('/logs', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const q = Query.parse(req.query);
    return reply.send(await opts.container.listLogsUseCase.execute(q.churchId, q.page, 20, q.severity));
  });
}

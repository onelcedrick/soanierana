import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateAvailabilityUseCase } from '../../application/availability/create-availability.use-case';
import type { Container } from '../container';

const AvailabilityBody = z.object({
  memberId: z.string().uuid(),
  type: z.enum(['REGULAR', 'EXCEPTION', 'UNAVAILABLE']),
  date: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function availabilityRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const createAvail = new CreateAvailabilityUseCase(opts.container.availabilityRepository, opts.container.memberRepository);
  app.post('/availabilities', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = AvailabilityBody.parse(request.body);
    return reply.status(201).send(await createAvail.execute(body));
  });
}

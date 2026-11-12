import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateEventUseCase } from '../../application/event/create-event.use-case';
import { ListEventsUseCase } from '../../application/event/list-events.use-case';
import type { Container } from '../container';

const CreateBody = z.object({
  churchId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  location: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
});

const ListQuery = z.object({ churchId: z.string().uuid(), upcoming: z.string().optional() });

export async function eventRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const createEvent = new CreateEventUseCase(opts.container.eventRepository, opts.container.churchRepository);
  const listEvents = new ListEventsUseCase(opts.container.eventRepository);

  app.get('/events', async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.send(await listEvents.execute(q.churchId, q.upcoming === 'true'));
  });

  app.post('/events', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const body = CreateBody.parse(req.body);
    return reply.status(201).send(await createEvent.execute(body));
  });
}

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateProgramUseCase } from '../../application/program/create-program.use-case';
import { CreateSessionUseCase } from '../../application/program/create-session.use-case';
import type { Container } from '../container';

const ProgramBody = z.object({
  churchId: z.string().uuid(),
  name: z.string().min(2),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ON_DEMAND']),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  startTime: z.string().nullable().optional(),
});

const SessionBody = z.object({
  programId: z.string().uuid(),
  date: z.string().datetime(),
});

const IdParams = z.object({ id: z.string().uuid() });
const ListQuery = z.object({ churchId: z.string().uuid() });

export async function programRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const createProgram = new CreateProgramUseCase(opts.container.programRepository, opts.container.churchRepository);
  const createSession = new CreateSessionUseCase(opts.container.programSessionRepository, opts.container.programRepository);

  app.get('/programs', async (request, reply) => {
    const q = ListQuery.parse(request.query);
    return reply.send(await opts.container.listProgramsUseCase.execute(q.churchId));
  });

  app.post('/programs', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const body = ProgramBody.parse(request.body);
    return reply.status(201).send(await createProgram.execute(body));
  });

  app.delete('/programs/:id', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const { id } = IdParams.parse(request.params);
    return reply.send(await opts.container.deleteProgramUseCase.execute(id));
  });

  app.post('/program-sessions', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const body = SessionBody.parse(request.body);
    return reply.status(201).send(await createSession.execute(body));
  });

  app.get('/program-sessions/:id/assignments', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = IdParams.parse(request.params);
      return reply.send(await opts.container.getSessionAssignmentsUseCase.execute(id));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Erreur serveur' });
    }
  });

  app.post('/program-sessions/:id/generate-assignments', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const { id } = IdParams.parse(request.params);
    return reply.send(await opts.container.generateAssignmentsUseCase.execute({ sessionId: id }));
  });

  app.post('/program-sessions/:id/publish', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = IdParams.parse(request.params);
      return reply.send(await opts.container.publishSessionUseCase.execute(id));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Erreur lors de la publication' });
    }
  });

  // 🚀 ROUTE DE RÉSERVATION ATOMIQUE (FIFO)
  app.post('/assignments/:id/claim', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = req.currentUser!.sub;

    try {
      // Requête SQL brute pour garantir l'atomicité (SKIP LOCKED)
      const result = await app.db.execute(sql`
        UPDATE assignments
        SET status = 'PROCESSING',
            claimed_by = ${userId},
            claimed_at = NOW()
        WHERE id = (
          SELECT id FROM assignments
          WHERE id = ${id} AND status = 'PROPOSED'
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `);

      if (result.rowCount === 0) {
        return reply.status(409).send({ 
          error: "Cette tâche a déjà été prise par quelqu'un d'autre ou n'est plus disponible." 
        });
      }

      return reply.send({ success: true, assignment: result.rows[0] });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: "Erreur lors de la réservation." });
    }
  });
  
}

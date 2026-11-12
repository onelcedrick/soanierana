import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateTaskUseCase } from '../../application/task/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/task/delete-task.use-case';
import { UpdateTaskUseCase } from '../../application/task/update-task.use-case';
import { db } from '../../infrastructure/database/client';
import { tasks } from '../../infrastructure/database/schema/task.table';
import { eq } from 'drizzle-orm';
import type { Container } from '../container';

const TaskBody = z.object({
  programId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  requiredPeople: z.number().int().min(1).optional(),
  eligibilityMode: z.enum(['PUBLIC', 'MEMBER', 'MINIMUM_GRADE', 'EXACT_GRADE', 'CUSTOM']).optional(),
  minimumGrade: z.enum(['LOHOLONA', 'DIAKONA', 'MAMBRA_TSOTRA']).nullable().optional(),
  exactGrade: z.enum(['LOHOLONA', 'DIAKONA', 'MAMBRA_TSOTRA']).nullable().optional(),
});

const IdParams = z.object({ id: z.string().uuid() });
const ListQuery = z.object({ programId: z.string().uuid() });

export async function taskRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const createTask = new CreateTaskUseCase(opts.container.taskRepository, opts.container.programRepository);
  const deleteTask = new DeleteTaskUseCase(opts.container.taskRepository);
  const updateTask = new UpdateTaskUseCase(opts.container.taskRepository);

  // Lister les tâches d'un programme
  app.get('/tasks', async (request, reply) => {
    const q = ListQuery.parse(request.query);
    const list = await db.select().from(tasks).where(eq(tasks.programId, q.programId));
    return reply.send(list);
  });

  // Créer une tâche
  app.post('/tasks', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const body = TaskBody.parse(request.body);
    return reply.status(201).send(await createTask.execute(body as any));
  });

  // Modifier une tâche
  app.put('/tasks/:id', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = IdParams.parse(request.params);
      const body = TaskBody.parse(request.body);
      return reply.send(await updateTask.execute(id, body as any));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Erreur lors de la modification' });
    }
  });

  // Supprimer une tâche
  app.delete('/tasks/:id', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = IdParams.parse(request.params);
      return reply.send(await deleteTask.execute(id));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Erreur lors de la suppression' });
    }
  });
}

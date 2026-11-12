import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateSkillUseCase } from '../../application/skill/create-skill.use-case';
import type { Container } from '../container';

const SkillBody = z.object({ churchId: z.string().uuid(), name: z.string().min(2) });
const ListQuery = z.object({ churchId: z.string().uuid() });

export async function skillRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const createSkill = new CreateSkillUseCase(opts.container.skillRepository, opts.container.churchRepository);
  
  app.get('/skills', async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.status(200).send(await opts.container.listSkillsUseCase.execute(q.churchId));
  });

  app.post('/skills', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = SkillBody.parse(request.body);
    return reply.status(201).send(await createSkill.execute(body));
  });
}

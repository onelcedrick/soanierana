import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { GetSettingsUseCase } from '../../application/settings/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../application/settings/update-settings.use-case';
import type { Container } from '../container';

const UpdateBody = z.object({
  rotationStrategy: z.enum(['FAIR_ROTATION', 'ROUND_ROBIN', 'LEAST_ASSIGNED']),
  rotationCycleWeeks: z.number().int().min(1).max(52),
  weightParticipation: z.number().min(0).max(100),
  weightRecency: z.number().min(0).max(100),
  weightAssignment: z.number().min(0).max(100),
  weightAvailability: z.number().min(0).max(100),
  weightSkill: z.number().min(0).max(100),
});
const Query = z.object({ churchId: z.string().uuid() });

export async function settingsRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const getSettings = new GetSettingsUseCase(c.siteSettingsRepository);
  const updateSettings = new UpdateSettingsUseCase(c.siteSettingsRepository);

  app.get('/settings', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { churchId } = Query.parse(req.query);
    const s = await getSettings.execute(churchId);
    return reply.send({
      rotationStrategy: s.rotationStrategy,
      rotationCycleWeeks: s.rotationCycleWeeks,
      weightParticipation: s.weightParticipation,
      weightRecency: s.weightRecency,
      weightAssignment: s.weightAssignment,
      weightAvailability: s.weightAvailability,
      weightSkill: s.weightSkill,
    });
  });

  app.put('/settings', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { churchId } = Query.parse(req.query);
    const body = UpdateBody.parse(req.body);
    return reply.send(await updateSettings.execute({ churchId, ...body }));
  });
}

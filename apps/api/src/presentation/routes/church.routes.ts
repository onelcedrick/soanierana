import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { GetChurchUseCase } from '../../application/church/get-church.use-case';
import { GetDefaultChurchUseCase } from '../../application/church/get-default-church.use-case';
import { UpdateBrandingUseCase } from '../../application/church/update-branding.use-case';
import { UpdateThemeUseCase } from '../../application/church/update-theme.use-case';
import type { Container } from '../container';

const IdParams = z.object({ id: z.string().uuid() });
const BrandingBody = z.object({ 
  coverImageUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional()
});

export async function churchRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const getDefault = new GetDefaultChurchUseCase(opts.container.churchRepository);
  const getChurch = new GetChurchUseCase(opts.container.churchRepository);
  const updateBranding = new UpdateBrandingUseCase(opts.container.churchRepository);
  const updateTheme = new UpdateThemeUseCase(opts.container.churchRepository);

  app.get('/church/default', async (_req, reply) => {
    const church = await getDefault.execute();
    return reply.send({ 
      id: church.id, name: church.name, city: church.city, country: church.country, 
      coverImageUrl: church.coverImageUrl, logoUrl: church.logoUrl, themeConfig: church.themeConfig 
    });
  });

  app.get('/churches/:id', async (request, reply) => {
    const { id } = IdParams.parse(request.params);
    return reply.send(await getChurch.execute(id));
  });

  app.put('/churches/:id/branding', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const { id } = IdParams.parse(request.params);
    const body = BrandingBody.parse(request.body);
    await updateBranding.execute(id, body.coverImageUrl, body.logoUrl);
    return reply.send({ success: true });
  });

  app.put('/churches/:id/theme', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const { id } = IdParams.parse(request.params);
    const body = z.object({ themeConfig: z.any() }).parse(request.body);
    await updateTheme.execute(id, body.themeConfig);
    return reply.send({ success: true });
  });
}

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreatePublicationUseCase } from '../../application/publication/create-publication.use-case';
import { PublishPublicationUseCase } from '../../application/publication/publish-publication.use-case';
import { ListPublicationsUseCase } from '../../application/publication/list-publications.use-case';
import { ListAllPublicationsUseCase } from '../../application/publication/list-all-publications.use-case';
import { UpdatePublicationUseCase } from '../../application/publication/update-publication.use-case';
import { DeletePublicationUseCase } from '../../application/publication/delete-publication.use-case';
import type { Container } from '../container';

const PublicationBody = z.object({
  churchId: z.string().uuid(),
  title: z.string().min(2),
  content: z.string().min(2),
  coverImageUrl: z.string().nullable().optional(),
  audience: z.enum(['PUBLIC', 'MEMBERS_ONLY']),
});
const UpdateBody = z.object({
  title: z.string().min(2).optional(),
  content: z.string().min(2).optional(),
  coverImageUrl: z.string().nullable().optional(),
  audience: z.enum(['PUBLIC', 'MEMBERS_ONLY']).optional(),
});
const IdParams = z.object({ id: z.string().uuid() });
const ListQuery = z.object({ churchId: z.string().uuid() });

export async function publicationRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const createPub = new CreatePublicationUseCase(c.publicationRepository, c.churchRepository);
  const publishPub = new PublishPublicationUseCase(c.publicationRepository);
  const listPubs = new ListPublicationsUseCase(c.publicationRepository);
  const listAllPubs = new ListAllPublicationsUseCase(c.publicationRepository);
  const updatePub = new UpdatePublicationUseCase(c.publicationRepository);
  const deletePub = new DeletePublicationUseCase(c.publicationRepository);

  app.get('/publications/public', async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.status(200).send(await listPubs.execute({ churchId: q.churchId, audience: 'PUBLIC' }));
  });

  app.get('/publications/all', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.status(200).send(await listAllPubs.execute(q.churchId));
  });

  app.post('/publications', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const body = PublicationBody.parse(req.body);
    const pub = await createPub.execute(body);
    await publishPub.execute(pub.id); // Par défaut, publié
    return reply.status(201).send(pub);
  });

  // LA ROUTE MANQUANTE
  app.post('/publications/:id/publish', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.status(200).send(await publishPub.execute(id));
  });

  app.put('/publications/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = UpdateBody.parse(req.body);
    return reply.status(200).send(await updatePub.execute({ id, ...body }));
  });

  app.delete('/publications/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    await deletePub.execute(id);
    return reply.status(204).send();
  });
}

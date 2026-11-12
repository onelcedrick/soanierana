import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateFormUseCase } from '../../application/form/create-form.use-case';
import { UpdateFormUseCase } from '../../application/form/update-form.use-case';
import { DeleteFormUseCase } from '../../application/form/delete-form.use-case';
import { PublishFormUseCase } from '../../application/form/publish-form.use-case';
import { ListFormsUseCase } from '../../application/form/list-forms.use-case';
import { SubmitResponseUseCase } from '../../application/form/submit-response.use-case';
import { ExportResponsesUseCase } from '../../application/form/export-responses.use-case';
import type { Container } from '../container';

const FieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'number', 'textarea', 'select']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const CreateBody = z.object({
  churchId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  audience: z.enum(['PUBLIC', 'MEMBERS_ONLY']),
  fields: z.array(FieldSchema).min(1),
});

const UpdateBody = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  audience: z.enum(['PUBLIC', 'MEMBERS_ONLY']).optional(),
  fields: z.array(FieldSchema).min(1).optional(),
});

const IdParams = z.object({ id: z.string().uuid() });
const ListQuery = z.object({ churchId: z.string().uuid() });

export async function formRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const createForm = new CreateFormUseCase(c.formRepository, c.churchRepository);
  const updateForm = new UpdateFormUseCase(c.formRepository);
  const deleteForm = new DeleteFormUseCase(c.formRepository);
  const publishForm = new PublishFormUseCase(c.formRepository);
  const listForms = new ListFormsUseCase(c.formRepository);
  const submitResponse = new SubmitResponseUseCase(c.formRepository);
  const exportResponses = new ExportResponsesUseCase(c.formRepository);

  app.get('/forms/all', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.send(await listForms.execute(q.churchId));
  });

  app.post('/forms', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const body = CreateBody.parse(req.body);
    return reply.status(201).send(await createForm.execute(body));
  });

  app.put('/forms/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = UpdateBody.parse(req.body);
    return reply.send(await updateForm.execute(id, body));
  });

  app.delete('/forms/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    await deleteForm.execute(id);
    return reply.status(204).send();
  });

  app.post('/forms/:id/publish', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.send(await publishForm.execute(id));
  });

  app.get('/forms/:id/export', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const csv = await exportResponses.execute(id);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="reponses.csv"');
    return reply.send(csv);
  });

  app.get('/forms/public', async (req, reply) => {
    const q = ListQuery.parse(req.query);
    const all = await listForms.execute(q.churchId);
    return reply.send(all.filter(f => f.status === 'PUBLISHED'));
  });

  app.post('/forms/:id/submit', async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = z.object({ data: z.record(z.any()) }).parse(req.body);
    return reply.status(201).send(await submitResponse.execute({ formId: id, data: body.data }));
  });
}

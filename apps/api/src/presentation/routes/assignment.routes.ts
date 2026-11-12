import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProposeAssignmentUseCase } from '../../application/assignment/propose-assignment.use-case';
import { RespondAssignmentUseCase } from '../../application/assignment/respond-assignment.use-case';
import { ConfirmAttendanceUseCase } from '../../application/assignment/confirm-attendance.use-case';
import { RequestReplacementUseCase } from '../../application/assignment/request-replacement.use-case';
import { DecideReplacementUseCase } from '../../application/assignment/decide-replacement.use-case';
import type { Container } from '../container';

const ProposeBody = z.object({
  sessionId: z.string().uuid(),
  taskId: z.string().uuid(),
  memberId: z.string().uuid(),
  justification: z.string().nullable().optional(),
});
const RespondBody = z.object({ memberId: z.string().uuid(), accept: z.boolean() });
const ConfirmBody = z.object({ attended: z.boolean() });
const ReplacementBody = z.object({ candidateMemberId: z.string().uuid() });
const DecideBody = z.object({ approve: z.boolean() });
const IdParams = z.object({ id: z.string().uuid() });

export async function assignmentRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const propose = new ProposeAssignmentUseCase(c.assignmentRepository, c.memberRepository, c.taskRepository, c.programSessionRepository);
  const respond = new RespondAssignmentUseCase(c.assignmentRepository, c.memberRepository);
  const confirm = new ConfirmAttendanceUseCase(c.assignmentRepository);
  const requestRepl = new RequestReplacementUseCase(c.replacementRepository, c.assignmentRepository, c.memberRepository);
  const decideRepl = new DecideReplacementUseCase(c.replacementRepository, c.assignmentRepository, c.memberRepository);

  app.post('/assignments', { preHandler: [app.authorize('ADMIN', 'RESPONSABLE')] }, async (req, reply) => {
    const body = ProposeBody.parse(req.body);
    return reply.status(201).send(await propose.execute(body));
  });

  app.post('/assignments/:id/respond', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = RespondBody.parse(req.body);
    return reply.status(200).send(await respond.execute({ assignmentId: id, ...body }));
  });

  app.post('/assignments/:id/attendance', { preHandler: [app.authorize('ADMIN', 'RESPONSABLE')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = ConfirmBody.parse(req.body);
    return reply.status(200).send(await confirm.execute({ assignmentId: id, ...body }));
  });

  app.post('/assignments/:id/replacements', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = ReplacementBody.parse(req.body);
    return reply.status(201).send(await requestRepl.execute({ assignmentId: id, ...body }));
  });

  app.post('/replacements/:id/decide', { preHandler: [app.authorize('ADMIN', 'RESPONSABLE')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = DecideBody.parse(req.body);
    const user = req.currentUser!;
    return reply.status(200).send(await decideRepl.execute({ replacementId: id, userId: user.sub, approve: body.approve }));
  });
}

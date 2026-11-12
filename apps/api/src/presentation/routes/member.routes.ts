import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateMemberUseCase } from '../../application/member/create-member.use-case';
import { CreateMemberAccountUseCase } from '../../application/member/create-member-account.use-case';
import { ListMembersUseCase } from '../../application/member/list-members.use-case';
import { GetProfileUseCase } from '../../application/member/get-profile.use-case';
import { PasswordService } from '../../application/auth/password.service';
import type { Container } from '../container';

const StatusEnum = z.enum(['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED']);
const LevelEnum = z.enum(['LOHOLONA', 'DIAKONA', 'MAMBRA_TSOTRA']);

const CreateBody = z.object({
  churchId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  membershipStatus: StatusEnum,
  responsibilityLevel: LevelEnum,
});

const CreateAccountBody = z.object({
  memberId: z.string().uuid(),
  password: z.string().min(8),
});

const AssignSkillBody = z.object({
  memberId: z.string().uuid(),
  skillId: z.string().uuid(),
});

const ListQuery = z.object({ churchId: z.string().uuid() });
const ExportQuery = z.object({ churchId: z.string().uuid() });

export async function memberRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const createMember = new CreateMemberUseCase(c.memberRepository, c.churchRepository);
  const createAccount = new CreateMemberAccountUseCase(c.userRepository, c.memberRepository, new PasswordService());
  const listMembers = new ListMembersUseCase(c.memberRepository);
  const getProfile = new GetProfileUseCase(c.memberRepository);

  // Route pour le profil du membre connecté
  app.get('/members/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = req.currentUser!;
    if (!user.memberId) {
      return reply.status(404).send({ error: 'Aucun profil membre associe a ce compte' });
    }
    return reply.send(await getProfile.execute(user.memberId));
  });

  app.get('/members', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const q = ListQuery.parse(request.query);
    return reply.send(await listMembers.execute(q.churchId));
  });

  app.post('/members', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const body = CreateBody.parse(request.body);
    return reply.status(201).send(await createMember.execute(body));
  });

  app.post('/members/create-account', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const body = CreateAccountBody.parse(request.body);
    return reply.status(201).send(await createAccount.execute(body));
  });

  app.post('/members/assign-skill', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = AssignSkillBody.parse(request.body);
    return reply.status(200).send(await c.assignSkillUseCase.execute(body));
  });

  app.get('/members/export', { preHandler: [app.authorize('ADMIN')] }, async (request, reply) => {
    const q = ExportQuery.parse(request.query);
    const csv = await c.exportMembersUseCase.execute(q.churchId);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="membres.csv"');
    return reply.send(csv);
  });
}

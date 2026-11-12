import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreatePollUseCase } from '../../application/poll/create-poll.use-case';
import { PublishPollUseCase } from '../../application/poll/publish-poll.use-case';
import { ClosePollUseCase } from '../../application/poll/close-poll.use-case';
import { CastMemberVoteUseCase } from '../../application/poll/cast-member-vote.use-case';
import { CastPublicVoteUseCase } from '../../application/poll/cast-public-vote.use-case';
import { GetPollResultsUseCase } from '../../application/poll/get-poll-results.use-case';
import { ListAllPollsUseCase } from '../../application/poll/list-all-polls.use-case';
import { ListPublicPollsUseCase } from '../../application/poll/list-public-polls.use-case';
import { DeletePollUseCase } from '../../application/poll/delete-poll.use-case';
import { GetPollReportUseCase } from '../../application/poll/get-poll-report.use-case';
import type { Container } from '../container';

const IdParams = z.object({ id: z.string().uuid() });
const ListQuery = z.object({ churchId: z.string().uuid() });

export async function pollRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const c = opts.container;
  const createPoll = new CreatePollUseCase(c.pollRepository, c.churchRepository);
  const publishPoll = new PublishPollUseCase(c.pollRepository);
  const closePoll = new ClosePollUseCase(c.pollRepository);
  const memberVote = new CastMemberVoteUseCase(c.pollRepository);
  const publicVote = new CastPublicVoteUseCase(c.pollRepository);
  const results = new GetPollResultsUseCase(c.pollRepository);
  const listAll = new ListAllPollsUseCase(c.pollRepository);
  const listPublic = new ListPublicPollsUseCase(c.pollRepository);
  const deletePoll = new DeletePollUseCase(c.pollRepository);
  const getReport = new GetPollReportUseCase(c.pollRepository);

  app.get('/polls/public', async (req, reply) => {
    const q = ListQuery.parse(req.query);
    let userId: string | null = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const decoded = await req.jwtVerify<any>().catch(() => null);
        if (decoded) userId = decoded.sub;
      }
    } catch {}
    return reply.status(200).send(await listPublic.execute(q.churchId, userId));
  });

  app.get('/polls/all', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const q = ListQuery.parse(req.query);
    return reply.status(200).send(await listAll.execute(q.churchId));
  });

  app.post('/polls', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const body = z.object({
      churchId: z.string().uuid(), title: z.string().min(2),
      description: z.string().nullable().optional(), audience: z.enum(['PUBLIC', 'MEMBERS_ONLY']),
      isAnonymous: z.boolean().optional(), isMultipleChoice: z.boolean().optional(),
      opensAt: z.string().datetime(), closesAt: z.string().datetime(),
      showResultsBeforeClose: z.boolean().optional(), options: z.array(z.string().min(1)).min(2),
    }).parse(req.body);
    return reply.status(201).send(await createPoll.execute(body));
  });

  app.post('/polls/:id/publish', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.status(200).send(await publishPoll.execute(id));
  });

  app.post('/polls/:id/close', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.status(200).send(await closePoll.execute(id));
  });

  app.delete('/polls/:id', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    await deletePoll.execute(id);
    return reply.status(204).send();
  });

  app.post('/polls/:id/vote', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = z.object({ optionIds: z.array(z.string().uuid()).min(1) }).parse(req.body);
    const user = req.currentUser!;
    return reply.status(200).send(await memberVote.execute({ pollId: id, userId: user.sub, optionIds: body.optionIds }));
  });

  app.post('/polls/:id/public-vote', async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const body = z.object({ token: z.string().min(8), optionIds: z.array(z.string().uuid()).min(1) }).parse(req.body);
    return reply.status(200).send(await publicVote.execute({ pollId: id, token: body.token, optionIds: body.optionIds }));
  });

  app.get('/polls/:id/results', async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.status(200).send(await results.execute(id));
  });

  app.get('/polls/:id/report', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    return reply.send(await getReport.execute(id));
  });

  app.get('/polls/:id/export', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = IdParams.parse(req.params);
    const report = await getReport.execute(id);
    
    let csv = `Sondage: ${report.poll.title}\n\n`;
    csv += `Option;Nombre de votes\n`;
    for (const t of report.totals) {
      csv += `"${t.label}";${t.count}\n`;
    }

    if (!report.poll.isAnonymous && report.detailedVotes.length > 0) {
      csv += `\n\nDétail des votants\n`;
      csv += `Votant;Email;Option choisie\n`;
      for (const v of report.detailedVotes) {
        csv += `"${v.voterName || 'Inconnu'}";"${v.voterEmail || ''}";"${v.optionLabel}"\n`;
      }
    }

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="rapport_sondage_${id}.csv"`);
    return reply.send(csv);
  });
}

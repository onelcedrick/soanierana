import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { loggerOptions } from './shared/logger';
import { registerErrorHandler } from './shared/error-handler';
import { registerNotFoundHandler } from './shared/not-found-handler';
import { healthRoutes } from './modules/health/health.route';
import { churchRoutes } from './presentation/routes/church.routes';
import { memberRoutes } from './presentation/routes/member.routes';
import { authRoutes } from './presentation/routes/auth.routes';
import { programRoutes } from './presentation/routes/program.routes';
import { taskRoutes } from './presentation/routes/task.routes';
import { skillRoutes } from './presentation/routes/skill.routes';
import { availabilityRoutes } from './presentation/routes/availability.routes';
import { assignmentRoutes } from './presentation/routes/assignment.routes';
import { pollRoutes } from './presentation/routes/poll.routes';
import { publicationRoutes } from './presentation/routes/publication.routes';
import { notificationRoutes } from './presentation/routes/notification.routes';
import { reportRoutes } from './presentation/routes/report.routes';
import { formRoutes } from './presentation/routes/form.routes';
import { eventRoutes } from './presentation/routes/event.routes';
import { settingsRoutes } from './presentation/routes/settings.routes';
import { auditRoutes } from './presentation/routes/audit.routes';
import { dashboardRoutes } from './presentation/routes/dashboard.routes';
import { messageRoutes } from './presentation/routes/message.routes';
import { albumRoutes } from './presentation/routes/album.routes';
import { campaignRoutes } from './presentation/routes/campaign.routes'; // <-- Import ajouté
import { authPlugin } from './presentation/plugins/auth.plugin';
import { auditPlugin } from './presentation/plugins/audit.plugin';
import { buildContainer } from './presentation/container';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ 
    logger: loggerOptions, 
    trustProxy: true,
    bodyLimit: 52428800 // 50MB
  });
  
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: env.FRONTEND_URL, credentials: true });
  await app.register(rateLimit, { max: 1000, timeWindow: '1 minute' });
  await app.register(authPlugin);

  registerErrorHandler(app);
  registerNotFoundHandler(app);

  const c = buildContainer();
  await app.register(auditPlugin, { container: c });
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api', container: c });
  await app.register(churchRoutes, { prefix: '/api', container: c });
  await app.register(memberRoutes, { prefix: '/api', container: c });
  await app.register(programRoutes, { prefix: '/api', container: c });
  await app.register(taskRoutes, { prefix: '/api', container: c });
  await app.register(skillRoutes, { prefix: '/api', container: c });
  await app.register(availabilityRoutes, { prefix: '/api', container: c });
  await app.register(assignmentRoutes, { prefix: '/api', container: c });
  await app.register(pollRoutes, { prefix: '/api', container: c });
  await app.register(publicationRoutes, { prefix: '/api', container: c });
  await app.register(notificationRoutes, { prefix: '/api', container: c });
  await app.register(reportRoutes, { prefix: '/api', container: c });
  await app.register(formRoutes, { prefix: '/api', container: c });
  await app.register(eventRoutes, { prefix: '/api', container: c });
  await app.register(settingsRoutes, { prefix: '/api', container: c });
  await app.register(auditRoutes, { prefix: '/api', container: c });
  await app.register(dashboardRoutes, { prefix: '/api', container: c });
  await app.register(messageRoutes, { prefix: '/api' });
  await app.register(albumRoutes, { prefix: '/api' });
  await app.register(campaignRoutes, { prefix: '/api' }); // <-- Enregistrement ajouté

  return app;
}

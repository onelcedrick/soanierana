import type { FastifyPluginAsync } from 'fastify';
import type { Container } from '../container';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const auditPlugin: FastifyPluginAsync<{ container: Container }> = async (app, opts) => {
  const { createLogUseCase } = opts.container;

  app.addHook('onResponse', async (request, reply) => {
    // 1. Ignorer les requêtes GET et celles qui ont échoué (4xx, 5xx)
    if (!MUTATING_METHODS.has(request.method)) return;
    if (reply.statusCode >= 400) return;

    // 2. Ignorer les routes publiques (ex: login, qui est déjà loggé manuellement)
    const url = request.url.split('?')[0]; // Enlever les query params
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/bootstrap')) {
      return;
    }

    // 3. Récupérer l'utilisateur (injecté par ton authPlugin)
    const user = request.currentUser || (request as any).user;
    if (!user || !user.churchId) return;

    // 4. Analyser l'URL pour déduire le module et l'action
    const segments = url.split('/').filter(Boolean); // ['api', 'albums', '123']
    const moduleName = segments[1] || 'unknown'; // 'albums', 'donations', 'polls'...
    
    let action = 'UNKNOWN';
    let entityId: string | undefined = undefined;
    
    const lastSegment = segments[segments.length - 1];
    const secondToLast = segments[segments.length - 2];

    // Détection de l'ID de l'entité (ex: /api/albums/123)
    if (segments.length >= 3 && segments[2] !== 'validate' && segments[2] !== 'publish') {
      entityId = segments[2];
    }

    // Déduction de l'action
    if (request.method === 'POST') {
      if (['validate', 'publish', 'close'].includes(lastSegment)) {
        action = lastSegment.toUpperCase(); // VALIDATE, PUBLISH, CLOSE
        entityId = secondToLast; // l'ID est juste avant l'action
      } else {
        action = 'CREATE';
      }
    } else if (request.method === 'PUT' || request.method === 'PATCH') {
      action = 'UPDATE';
    } else if (request.method === 'DELETE') {
      action = 'DELETE';
    }

    // 5. Construire une description lisible
    let description = `Action ${action} sur ${moduleName}`;
    const body = request.body as any;
    if (body && body.title) description += ` : "${body.title}"`;
    else if (body && body.name) description += ` : "${body.name}"`;

    // 6. Déterminer la sévérité
    const severity = action === 'DELETE' ? 'WARNING' : 'INFO';

    // 7. Enregistrer le log via ton Use Case
    try {
      await createLogUseCase.execute({
        churchId: user.churchId,
        actorId: user.sub, // 'sub' contient l'ID utilisateur dans ton JWT
        module: moduleName,
        action,
        description,
        severity,
        entityId,
        ipAddress: request.ip
      });
    } catch (err) {
      request.log.error({ err }, 'Erreur lors de la création du log d\'audit automatique');
    }
  });
};

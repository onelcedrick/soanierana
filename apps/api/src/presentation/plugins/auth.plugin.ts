import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../../config/env';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors';
import type { UserRole } from '../../domain/user/user';

export interface JwtPayload {
  sub: string;
  churchId: string;
  role: UserRole;
  memberId: string | null;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (...roles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    currentUser?: JwtPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

async function authPluginImpl(app: FastifyInstance): Promise<void> {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '7d' },
  });

  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      request.currentUser = request.user;
    } catch {
      throw new UnauthorizedError('Token invalide ou expire');
    }
  });

  app.decorate('authorize', (...roles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await app.authenticate(request, reply);
      const user = request.currentUser;
      if (!user || !roles.includes(user.role)) {
        throw new ForbiddenError('Role insuffisant');
      }
    };
  });
}

export const authPlugin = fp(authPluginImpl, { name: 'auth-plugin' });

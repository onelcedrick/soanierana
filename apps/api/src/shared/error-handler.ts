import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | AppError | ZodError, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof ZodError) {
        request.log.warn({ err: error }, 'Validation error');
        return reply.status(422).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Donnees invalides',
            details: error.flatten().fieldErrors,
          },
        });
      }

      if (error instanceof AppError) {
        request.log.warn({ err: error }, 'Application error');
        return reply.status(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        (error as { statusCode: number }).statusCode === 429
      ) {
        return reply.status(429).send({
          error: {
            code: 'RATE_LIMIT',
            message: 'Trop de requetes',
          },
        });
      }

      request.log.error({ err: error }, 'Unhandled error');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur',
        },
      });
    },
  );
}

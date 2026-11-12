import type { FastifyServerOptions } from 'fastify';
import { env } from '../config/env';

export const loggerOptions: FastifyServerOptions['logger'] = {
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
};

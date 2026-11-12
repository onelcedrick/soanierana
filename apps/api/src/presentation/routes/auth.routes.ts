import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { BootstrapUseCase } from '../../application/auth/bootstrap.use-case';
import { PasswordService } from '../../application/auth/password.service';
import type { Container } from '../container';

const BootstrapBody = z.object({
  churchName: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterBody = z.object({
  churchId: z.string().uuid(),
  memberId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'RESPONSABLE', 'MEMBER']),
});

export async function authRoutes(app: FastifyInstance, opts: { container: Container }): Promise<void> {
  const passwords = new PasswordService();
  const register = new RegisterUseCase(opts.container.userRepository, opts.container.churchRepository, passwords);
  const login = new LoginUseCase(opts.container.userRepository, passwords);
  const bootstrap = new BootstrapUseCase(opts.container.churchRepository, opts.container.userRepository, passwords);

  app.get('/auth/status', async (_req, reply) => {
    const count = await opts.container.userRepository.countAll();
    return reply.send({ initialized: count > 0 });
  });

  app.post('/auth/bootstrap', async (req, reply) => {
    const body = BootstrapBody.parse(req.body);
    const result = await bootstrap.execute(body);
    return reply.status(201).send(result);
  });

  app.post('/auth/register', async (req, reply) => {
    const body = RegisterBody.parse(req.body);
    const result = await register.execute(body);
    return reply.status(201).send(result);
  });

  app.post('/auth/login', async (req, reply) => {
    const body = LoginBody.parse(req.body);
    const user = await login.execute(body);
    
    // Log de connexion
    await opts.container.createLogUseCase.execute({
      churchId: user.churchId, actorId: user.id, action: 'LOGIN', module: 'auth',
      description: 'Connexion reussie', severity: 'INFO'
    });

    const token = await reply.jwtSign({
      sub: user.id,
      churchId: user.churchId,
      role: user.role,
      memberId: user.memberId,
    });
    return reply.status(200).send({ token, user });
  });

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.status(200).send(req.currentUser);
  });
}

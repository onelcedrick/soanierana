import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreateProgramUseCase } from '../../src/application/program/create-program.use-case';
import { CreateTaskUseCase } from '../../src/application/task/create-task.use-case';
import { CreateSessionUseCase } from '../../src/application/program/create-session.use-case';
import { CreateMemberUseCase } from '../../src/application/member/create-member.use-case';
import { RegisterUseCase } from '../../src/application/auth/register.use-case';
import { PasswordService } from '../../src/application/auth/password.service';
import { ProposeAssignmentUseCase } from '../../src/application/assignment/propose-assignment.use-case';
import { RespondAssignmentUseCase } from '../../src/application/assignment/respond-assignment.use-case';
import { ConfirmAttendanceUseCase } from '../../src/application/assignment/confirm-attendance.use-case';
import { RequestReplacementUseCase } from '../../src/application/assignment/request-replacement.use-case';
import { DecideReplacementUseCase } from '../../src/application/assignment/decide-replacement.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzleProgramRepository } from '../../src/infrastructure/repositories/drizzle-program.repository';
import { DrizzleTaskRepository } from '../../src/infrastructure/repositories/drizzle-task.repository';
import { DrizzleProgramSessionRepository } from '../../src/infrastructure/repositories/drizzle-program-session.repository';
import { DrizzleMemberRepository } from '../../src/infrastructure/repositories/drizzle-member.repository';
import { DrizzleUserRepository } from '../../src/infrastructure/repositories/drizzle-user.repository';
import { DrizzleAssignmentRepository } from '../../src/infrastructure/repositories/drizzle-assignment.repository';
import { DrizzleReplacementRequestRepository } from '../../src/infrastructure/repositories/drizzle-replacement-request.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { replacementRequests, assignments } from '../../src/infrastructure/database/schema/assignment.table';
import { programSessions } from '../../src/infrastructure/database/schema/program-session.table';
import { tasks } from '../../src/infrastructure/database/schema/task.table';
import { programs } from '../../src/infrastructure/database/schema/program.table';
import { users } from '../../src/infrastructure/database/schema/user.table';
import { members } from '../../src/infrastructure/database/schema/member.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('Phase 6 (integration)', () => {
  beforeEach(async () => {
    await db.delete(replacementRequests);
    await db.delete(assignments);
    await db.delete(programSessions);
    await db.delete(tasks);
    await db.delete(programs);
    await db.delete(users);
    await db.delete(members);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  async function setup() {
    const churchRepo = new DrizzleChurchRepository(db);
    const programRepo = new DrizzleProgramRepository(db);
    const taskRepo = new DrizzleTaskRepository(db);
    const sessionRepo = new DrizzleProgramSessionRepository(db);
    const memberRepo = new DrizzleMemberRepository(db);
    const userRepo = new DrizzleUserRepository(db);
    const assignRepo = new DrizzleAssignmentRepository(db);
    const replRepo = new DrizzleReplacementRequestRepository(db);

    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    const program = await new CreateProgramUseCase(programRepo, churchRepo).execute({
      churchId: church.id, name: 'Sabata Culte', frequency: 'WEEKLY', dayOfWeek: 6,
    });
    const task = await new CreateTaskUseCase(taskRepo, programRepo).execute({
      programId: program.id, name: 'Mitarika',
    });
    const session = await new CreateSessionUseCase(sessionRepo, programRepo).execute({
      programId: program.id, date: '2026-11-14T08:00:00.000Z',
    });
    const member = await new CreateMemberUseCase(memberRepo, churchRepo).execute({
      churchId: church.id, firstName: 'Jean', lastName: 'Rakoto',
      email: 'jean@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    });
    const member2 = await new CreateMemberUseCase(memberRepo, churchRepo).execute({
      churchId: church.id, firstName: 'Paul', lastName: 'Rabe',
      email: 'paul@example.com', phone: '+261340000001',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    });

    // Creer un utilisateur ADMIN pour decider du remplacement
    const passwords = new PasswordService();
    const admin = await new RegisterUseCase(userRepo, churchRepo, passwords).execute({
      churchId: church.id, email: 'admin@example.com', password: 'secret123', role: 'ADMIN',
    });

    return { church, program, task, session, member, member2, admin, assignRepo, replRepo, memberRepo, taskRepo, sessionRepo };
  }

  it('propose, accepte et confirme presence', async () => {
    const { session, task, member, assignRepo, memberRepo, taskRepo, sessionRepo } = await setup();
    const propose = new ProposeAssignmentUseCase(assignRepo, memberRepo, taskRepo, sessionRepo);
    const respond = new RespondAssignmentUseCase(assignRepo, memberRepo);
    const confirm = new ConfirmAttendanceUseCase(assignRepo);

    const a = await propose.execute({ sessionId: session.id, taskId: task.id, memberId: member.id });
    expect(a.status).toBe('PROPOSED');

    const r = await respond.execute({ assignmentId: a.id, memberId: member.id, accept: true });
    expect(r.status).toBe('ACCEPTED');

    const c = await confirm.execute({ assignmentId: a.id, attended: true });
    expect(c.status).toBe('ATTENDED');

    const count = await assignRepo.countAttendanceByMember(member.id);
    expect(count).toBe(1);
  });

  it('decline puis cree un remplacement approuve', async () => {
    const { session, task, member, member2, admin, assignRepo, replRepo, memberRepo, taskRepo, sessionRepo } = await setup();
    const propose = new ProposeAssignmentUseCase(assignRepo, memberRepo, taskRepo, sessionRepo);
    const respond = new RespondAssignmentUseCase(assignRepo, memberRepo);
    const requestRepl = new RequestReplacementUseCase(replRepo, assignRepo, memberRepo);
    const decideRepl = new DecideReplacementUseCase(replRepo, assignRepo, memberRepo);

    const a = await propose.execute({ sessionId: session.id, taskId: task.id, memberId: member.id });
    await respond.execute({ assignmentId: a.id, memberId: member.id, accept: false });

    const r = await requestRepl.execute({ assignmentId: a.id, candidateMemberId: member2.id });
    expect(r.status).toBe('PENDING');

    const dec = await decideRepl.execute({
      replacementId: r.id, userId: admin.id, approve: true,
    });
    expect(dec.replacementStatus).toBe('APPROVED');
    expect(dec.newAssignmentId).not.toBeNull();
  });
});

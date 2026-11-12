import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreateProgramUseCase } from '../../src/application/program/create-program.use-case';
import { CreateTaskUseCase } from '../../src/application/task/create-task.use-case';
import { CreateSessionUseCase } from '../../src/application/program/create-session.use-case';
import { CreateSkillUseCase } from '../../src/application/skill/create-skill.use-case';
import { CreateAvailabilityUseCase } from '../../src/application/availability/create-availability.use-case';
import { CreateMemberUseCase } from '../../src/application/member/create-member.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzleProgramRepository } from '../../src/infrastructure/repositories/drizzle-program.repository';
import { DrizzleTaskRepository } from '../../src/infrastructure/repositories/drizzle-task.repository';
import { DrizzleProgramSessionRepository } from '../../src/infrastructure/repositories/drizzle-program-session.repository';
import { DrizzleSkillRepository } from '../../src/infrastructure/repositories/drizzle-skill.repository';
import { DrizzleAvailabilityRepository } from '../../src/infrastructure/repositories/drizzle-availability.repository';
import { DrizzleMemberRepository } from '../../src/infrastructure/repositories/drizzle-member.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { availabilities } from '../../src/infrastructure/database/schema/availability.table';
import { taskRequiredSkills, memberSkills, skills } from '../../src/infrastructure/database/schema/skill.table';
import { programSessions } from '../../src/infrastructure/database/schema/program-session.table';
import { tasks } from '../../src/infrastructure/database/schema/task.table';
import { programs } from '../../src/infrastructure/database/schema/program.table';
import { members } from '../../src/infrastructure/database/schema/member.table';
import { users } from '../../src/infrastructure/database/schema/user.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('Phase 5 (integration)', () => {
  beforeEach(async () => {
    await db.delete(availabilities);
    await db.delete(taskRequiredSkills);
    await db.delete(memberSkills);
    await db.delete(skills);
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
    const skillRepo = new DrizzleSkillRepository(db);
    const availRepo = new DrizzleAvailabilityRepository(db);
    const memberRepo = new DrizzleMemberRepository(db);

    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    return { churchRepo, programRepo, taskRepo, sessionRepo, skillRepo, availRepo, memberRepo, church };
  }

  it('cree un programme + tache + session', async () => {
    const { programRepo, taskRepo, sessionRepo, churchRepo, church } = await setup();
    const program = await new CreateProgramUseCase(programRepo, churchRepo).execute({
      churchId: church.id, name: 'Sabata Culte', frequency: 'WEEKLY', dayOfWeek: 6,
    });
    const task = await new CreateTaskUseCase(taskRepo, programRepo).execute({
      programId: program.id, name: 'Mitarika', requiredPeople: 1,
    });
    const session = await new CreateSessionUseCase(sessionRepo, programRepo).execute({
      programId: program.id, date: '2026-11-14T08:00:00.000Z',
    });
    expect(program.id).toBeDefined();
    expect(task.programId).toBe(program.id);
    expect(session.date).toBe('2026-11-14T08:00:00.000Z');
  });

  it('cree une competence', async () => {
    const { skillRepo, churchRepo, church } = await setup();
    const out = await new CreateSkillUseCase(skillRepo, churchRepo).execute({
      churchId: church.id, name: 'Lecture biblique',
    });
    expect(out.name).toBe('Lecture biblique');
  });

  it('cree une disponibilite pour un membre', async () => {
    const { availRepo, memberRepo, churchRepo, church } = await setup();
    const member = await new CreateMemberUseCase(memberRepo, churchRepo).execute({
      churchId: church.id, firstName: 'Jean', lastName: 'Rakoto',
      email: 'jean@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    });
    const out = await new CreateAvailabilityUseCase(availRepo, memberRepo).execute({
      memberId: member.id, type: 'UNAVAILABLE',
      startDate: '2026-12-01T00:00:00.000Z', endDate: '2026-12-10T00:00:00.000Z',
    });
    expect(out.type).toBe('UNAVAILABLE');
  });
});

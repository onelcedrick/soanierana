import { db } from '../infrastructure/database/client';
import { DrizzleChurchRepository } from '../infrastructure/repositories/drizzle-church.repository';
import { DrizzleMemberRepository } from '../infrastructure/repositories/drizzle-member.repository';
import { DrizzleUserRepository } from '../infrastructure/repositories/drizzle-user.repository';
import { DrizzleProgramRepository } from '../infrastructure/repositories/drizzle-program.repository';
import { DrizzleTaskRepository } from '../infrastructure/repositories/drizzle-task.repository';
import { DrizzleProgramSessionRepository } from '../infrastructure/repositories/drizzle-program-session.repository';
import { DrizzleSkillRepository } from '../infrastructure/repositories/drizzle-skill.repository';
import { DrizzleAvailabilityRepository } from '../infrastructure/repositories/drizzle-availability.repository';
import { DrizzleAssignmentRepository } from '../infrastructure/repositories/drizzle-assignment.repository';
import { DrizzleReplacementRequestRepository } from '../infrastructure/repositories/drizzle-replacement-request.repository';
import { DrizzlePollRepository } from '../infrastructure/repositories/drizzle-poll.repository';
import { DrizzleEventCategoryRepository } from '../infrastructure/repositories/drizzle-event-category.repository';
import { DrizzlePublicationRepository } from '../infrastructure/repositories/drizzle-publication.repository';
import { DrizzleNotificationRepository } from '../infrastructure/repositories/drizzle-notification.repository';
import { DrizzleFormRepository } from '../infrastructure/repositories/drizzle-form.repository';
import { DrizzleEventRepository } from '../infrastructure/repositories/drizzle-event.repository';
import { DrizzleSiteSettingsRepository } from '../infrastructure/repositories/drizzle-site-settings.repository';
import { DrizzleAuditLogRepository } from '../infrastructure/repositories/drizzle-audit-log.repository';

import { NotifyUseCase } from '../application/notification/notify.use-case';
import { ChurchStatsUseCase } from '../application/report/church-stats.use-case';
import { GetAnalyticsUseCase } from '../application/report/get-analytics.use-case';
import { ListSkillsUseCase } from '../application/skill/list-skills.use-case';
import { AssignSkillUseCase } from '../application/member/assign-skill.use-case';
import { ExportMembersUseCase } from '../application/member/export-members.use-case';
import { GenerateAssignmentsUseCase } from '../application/assignment/generate-assignments.use-case';
import { GetSessionAssignmentsUseCase } from '../application/assignment/get-session-assignments.use-case';
import { ListProgramsUseCase } from '../application/program/list-programs.use-case';
import { CreateLogUseCase } from '../application/audit/create-log.use-case';
import { ListLogsUseCase } from '../application/audit/list-logs.use-case';
import { GetDashboardStatsUseCase } from '../application/dashboard/get-dashboard-stats.use-case';
import { GetPollReportUseCase } from '../application/poll/get-poll-report.use-case';
import { PublishSessionUseCase } from '../application/program/publish-session.use-case';
import { DeleteProgramUseCase } from '../application/program/delete-program.use-case';
import { DeleteTaskUseCase } from '../application/task/delete-task.use-case';
import { UpdateTaskUseCase } from '../application/task/update-task.use-case';

export interface Container {
  churchRepository: any; memberRepository: any; userRepository: any;
  programRepository: any; taskRepository: any; programSessionRepository: any;
  skillRepository: any; availabilityRepository: any; assignmentRepository: any;
  replacementRepository: any; pollRepository: any; eventCategoryRepository: any;
  publicationRepository: any; notificationRepository: any; formRepository: any;
  eventRepository: any; siteSettingsRepository: any; auditLogRepository: any;
  
  notifyUseCase: any; churchStatsUseCase: any; getAnalyticsUseCase: any;
  listSkillsUseCase: any; assignSkillUseCase: any; exportMembersUseCase: any;
  generateAssignmentsUseCase: any; getSessionAssignmentsUseCase: any;
  listProgramsUseCase: any; createLogUseCase: any; listLogsUseCase: any;
  getDashboardStatsUseCase: any; getPollReportUseCase: any;
  publishSessionUseCase: any; deleteProgramUseCase: any;
  deleteTaskUseCase: any; updateTaskUseCase: any;
}

export function buildContainer(): Container {
  const notificationRepository = new DrizzleNotificationRepository(db);
  const skillRepository = new DrizzleSkillRepository(db);
  const memberRepository = new DrizzleMemberRepository(db);
  const formRepository = new DrizzleFormRepository(db);
  const eventRepository = new DrizzleEventRepository(db);
  const programRepository = new DrizzleProgramRepository(db);
  const siteSettingsRepository = new DrizzleSiteSettingsRepository(db);
  const auditLogRepository = new DrizzleAuditLogRepository(db);
  const pollRepository = new DrizzlePollRepository(db);
  const programSessionRepository = new DrizzleProgramSessionRepository(db);
  const publicationRepository = new DrizzlePublicationRepository(db);
  const taskRepository = new DrizzleTaskRepository(db);

  return {
    churchRepository: new DrizzleChurchRepository(db),
    memberRepository, userRepository: new DrizzleUserRepository(db),
    programRepository, taskRepository, programSessionRepository,
    skillRepository, availabilityRepository: new DrizzleAvailabilityRepository(db),
    assignmentRepository: new DrizzleAssignmentRepository(db),
    replacementRepository: new DrizzleReplacementRequestRepository(db),
    pollRepository, eventCategoryRepository: new DrizzleEventCategoryRepository(db),
    publicationRepository, notificationRepository, formRepository,
    eventRepository, siteSettingsRepository, auditLogRepository,

    notifyUseCase: new NotifyUseCase(notificationRepository),
    churchStatsUseCase: new ChurchStatsUseCase(db),
    getAnalyticsUseCase: new GetAnalyticsUseCase(db),
    listSkillsUseCase: new ListSkillsUseCase(skillRepository),
    assignSkillUseCase: new AssignSkillUseCase(memberRepository),
    exportMembersUseCase: new ExportMembersUseCase(),
    generateAssignmentsUseCase: new GenerateAssignmentsUseCase(db),
    getSessionAssignmentsUseCase: new GetSessionAssignmentsUseCase(db),
    listProgramsUseCase: new ListProgramsUseCase(programRepository),
    createLogUseCase: new CreateLogUseCase(auditLogRepository),
    listLogsUseCase: new ListLogsUseCase(auditLogRepository),
    getDashboardStatsUseCase: new GetDashboardStatsUseCase(db),
    getPollReportUseCase: new GetPollReportUseCase(pollRepository),
    
    publishSessionUseCase: new PublishSessionUseCase(programSessionRepository, programRepository, publicationRepository, db),
    deleteProgramUseCase: new DeleteProgramUseCase(programRepository),
    deleteTaskUseCase: new DeleteTaskUseCase(taskRepository),
    updateTaskUseCase: new UpdateTaskUseCase(taskRepository),
  };
}

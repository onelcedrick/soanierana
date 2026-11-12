import { eq } from 'drizzle-orm';
import type { Db } from '../../infrastructure/database/client';
import type { ProgramSessionRepository } from '../../domain/program/program-session.repository';
import type { ProgramRepository } from '../../domain/program/program.repository';
import type { PublicationRepository } from '../../domain/publication/publication.repository';
import { Publication } from '../../domain/publication/publication';
import { NotFoundError } from '../../shared/errors';
import { assignments, tasks, members } from '../../infrastructure/database/schema';

export class PublishSessionUseCase {
  constructor(
    private readonly sessions: ProgramSessionRepository,
    private readonly programs: ProgramRepository,
    private readonly pubs: PublicationRepository,
    private readonly db: Db,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) throw new NotFoundError('Session');

    const program = await this.programs.findById(session.programId);
    if (!program) throw new NotFoundError('Programme');

    // 1. Publier la session (verrouille la semaine)
    session.publish();
    await this.sessions.update(session);

    // 2. Récupérer tous les participants (tâche + nom)
    const assignmentDetails = await this.db
      .select({
        taskName: tasks.name,
        firstName: members.firstName,
        lastName: members.lastName,
      })
      .from(assignments)
      .innerJoin(tasks, eq(assignments.taskId, tasks.id))
      .innerJoin(members, eq(assignments.memberId, members.id))
      .where(eq(assignments.sessionId, sessionId));

    // 3. Construire le contenu de l'actualité
    const dateStr = session.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    let content = `Le programme pour le ${program.name} du ${dateStr} a été publié.\n\n`;
    
    content += `Détail des participants :\n`;
    if (assignmentDetails.length === 0) {
      content += `Aucun participant affecté pour le moment.`;
    } else {
      for (const a of assignmentDetails) {
        content += `- ${a.taskName} : ${a.firstName} ${a.lastName}\n`;
      }
    }

    // 4. Créer l'actualité en attente (DRAFT)
    const pub = Publication.create({
      churchId: program.churchId,
      title: `Programme du ${dateStr}`,
      content: content,
      audience: 'PUBLIC',
    });

    await this.pubs.save(pub);

    return { success: true };
  }
}

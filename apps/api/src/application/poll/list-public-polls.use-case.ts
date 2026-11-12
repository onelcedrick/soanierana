import type { PollRepository } from '../../domain/poll/poll.repository';

export class ListPublicPollsUseCase {
  constructor(private readonly polls: PollRepository) {}
  
  async execute(churchId: string, userId?: string | null) {
    const list = await this.polls.findByChurch(churchId);
    
    // On filtre selon les droits
    const filtered = list.filter(p => {
      if (p.status !== 'PUBLISHED' && p.status !== 'CLOSED') return false;
      if (p.audience === 'PUBLIC') return true;
      if (p.audience === 'MEMBERS_ONLY' && userId) return true;
      return false;
    });

    const result = [];
    for (const p of filtered) {
      const options = await this.polls.findOptions(p.id);
      
      // On vérifie si l'utilisateur connecté a déjà voté
      let hasVoted = false;
      if (userId && p.audience === 'MEMBERS_ONLY') {
        hasVoted = await this.polls.hasUserVoted(p.id, userId);
      }

      result.push({
        id: p.id,
        title: p.title,
        status: p.status,
        audience: p.audience,
        opensAt: p.opensAt.toISOString(),
        closesAt: p.closesAt.toISOString(),
        hasVoted: hasVoted, // <-- Nouveau champ
        options: options.map(o => ({ id: o.id, label: o.label })),
      });
    }
    return result;
  }
}

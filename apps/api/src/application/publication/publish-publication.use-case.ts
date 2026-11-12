import type { PublicationRepository } from '../../domain/publication/publication.repository';
import { NotFoundError } from '../../shared/errors';

export class PublishPublicationUseCase {
  constructor(private readonly pubs: PublicationRepository) {}
  async execute(id: string): Promise<{ id: string; status: string }> {
    const p = await this.pubs.findById(id);
    if (!p) throw new NotFoundError('Publication');
    
    p.publish(); // Met le statut à PUBLISHED et la date à NOW()
    await this.pubs.update(p);
    
    return { id: p.id, status: p.status };
  }
}

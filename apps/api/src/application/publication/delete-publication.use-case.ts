import type { PublicationRepository } from '../../domain/publication/publication.repository';
import { NotFoundError } from '../../shared/errors';

export class DeletePublicationUseCase {
  constructor(private readonly pubs: PublicationRepository) {}
  async execute(id: string): Promise<void> {
    const pub = await this.pubs.findById(id);
    if (!pub) throw new NotFoundError('Publication');
    await this.pubs.delete(id);
  }
}

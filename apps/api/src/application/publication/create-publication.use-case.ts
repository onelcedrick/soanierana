import { Publication, type PublicationAudience } from '../../domain/publication/publication';
import type { PublicationRepository } from '../../domain/publication/publication.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreatePublicationInput {
  churchId: string; categoryId?: string | null;
  title: string; content: string; coverImageUrl?: string | null;
  audience: PublicationAudience;
  eventDate?: string | null; eventTime?: string | null; location?: string | null;
}

export class CreatePublicationUseCase {
  constructor(private readonly pubs: PublicationRepository, private readonly churches: ChurchRepository) {}
  async execute(input: CreatePublicationInput): Promise<{ id: string; status: string }> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    const p = Publication.create({
      churchId: input.churchId,
      categoryId: input.categoryId ?? null,
      title: input.title, content: input.content,
      coverImageUrl: input.coverImageUrl ?? null, audience: input.audience,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
      eventTime: input.eventTime ?? null, location: input.location ?? null,
    });
    await this.pubs.save(p);
    return { id: p.id, status: p.status };
  }
}

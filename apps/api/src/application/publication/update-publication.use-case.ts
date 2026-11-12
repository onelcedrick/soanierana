import type { PublicationRepository } from '../../domain/publication/publication.repository';
import { NotFoundError } from '../../shared/errors';

export interface UpdatePublicationInput {
  id: string;
  title?: string;
  content?: string;
  audience?: 'PUBLIC' | 'MEMBERS_ONLY';
  coverImageUrl?: string | null;
}

export class UpdatePublicationUseCase {
  constructor(private readonly pubs: PublicationRepository) {}
  async execute(input: UpdatePublicationInput): Promise<{ id: string }> {
    const pub = await this.pubs.findById(input.id);
    if (!pub) throw new NotFoundError('Publication');
    pub.update({ 
      title: input.title, 
      content: input.content, 
      audience: input.audience,
      coverImageUrl: input.coverImageUrl
    });
    await this.pubs.update(pub);
    return { id: pub.id };
  }
}

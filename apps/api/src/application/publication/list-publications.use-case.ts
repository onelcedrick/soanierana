import type { PublicationRepository } from '../../domain/publication/publication.repository';

export interface ListPublicationsInput {
  churchId: string; audience: 'PUBLIC' | 'MEMBERS_ONLY' | 'ALL';
}

export class ListPublicationsUseCase {
  constructor(private readonly pubs: PublicationRepository) {}
  async execute(input: ListPublicationsInput) {
    const list = input.audience === 'ALL'
      ? await this.pubs.findByChurch(input.churchId)
      : await this.pubs.findByChurch(input.churchId, { audience: input.audience });
    
    return list.filter((p) => p.status === 'PUBLISHED').map((p) => ({
      id: p.id, 
      title: p.title, 
      content: p.content, 
      audience: p.audience,
      coverImageUrl: p.coverImageUrl, // <-- On renvoie l'image !
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }));
  }
}

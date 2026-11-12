import type { PublicationRepository } from '../../domain/publication/publication.repository';

export class ListAllPublicationsUseCase {
  constructor(private readonly pubs: PublicationRepository) {}
  async execute(churchId: string) {
    const list = await this.pubs.findByChurch(churchId);
    return list.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      audience: p.audience,
      status: p.status,
      coverImageUrl: p.coverImageUrl, // <-- L'image est maintenant renvoyée
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }));
  }
}

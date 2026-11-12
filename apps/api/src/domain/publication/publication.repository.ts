import type { Publication } from './publication';

export interface PublicationRepository {
  findById(id: string): Promise<Publication | null>;
  findByChurch(churchId: string, opts?: { audience?: 'PUBLIC' | 'MEMBERS_ONLY' }): Promise<Publication[]>;
  save(pub: Publication): Promise<void>;
  update(pub: Publication): Promise<void>;
  delete(id: string): Promise<void>;
}

import type { ReplacementRequest } from './replacement-request';

export interface ReplacementRequestRepository {
  findById(id: string): Promise<ReplacementRequest | null>;
  findByAssignment(assignmentId: string): Promise<ReplacementRequest[]>;
  save(request: ReplacementRequest): Promise<void>;
  update(request: ReplacementRequest): Promise<void>;
}

import { Church } from '../../domain/church/church';
import type { ChurchRepository } from '../../domain/church/church.repository';

export interface CreateChurchInput { name: string; city: string; country: string; }
export interface CreateChurchOutput { id: string; name: string; city: string; country: string; }

export class CreateChurchUseCase {
  constructor(private readonly churches: ChurchRepository) {}

  async execute(input: CreateChurchInput): Promise<CreateChurchOutput> {
    const church = Church.create(input);
    await this.churches.save(church);
    return { id: church.id, name: church.name, city: church.city, country: church.country };
  }
}

import { Event } from '../../domain/event/event';
import type { EventRepository } from '../../domain/event/event.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateEventInput {
  churchId: string; title: string; description?: string | null;
  startDate: string; endDate?: string | null; location?: string | null;
  coverImageUrl?: string | null;
}

export class CreateEventUseCase {
  constructor(private readonly events: EventRepository, private readonly churches: ChurchRepository) {}
  async execute(input: CreateEventInput) {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    
    const event = Event.create({
      churchId: input.churchId, title: input.title, description: input.description,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      location: input.location, coverImageUrl: input.coverImageUrl,
    });
    await this.events.save(event);
    return { id: event.id };
  }
}

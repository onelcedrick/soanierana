import type { EventRepository } from '../../domain/event/event.repository';

export class ListEventsUseCase {
  constructor(private readonly events: EventRepository) {}
  async execute(churchId: string, upcomingOnly = false) {
    const list = upcomingOnly 
      ? await this.events.findUpcoming(churchId)
      : await this.events.findByChurch(churchId);
      
    return list.map((e) => ({
      id: e.id, title: e.title, description: e.description,
      startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString() ?? null,
      location: e.location, coverImageUrl: e.coverImageUrl,
    }));
  }
}

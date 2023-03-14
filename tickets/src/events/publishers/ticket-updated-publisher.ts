import { Publisher, Subjects, TicketUpdatedEvent } from '@devsmash/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

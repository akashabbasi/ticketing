import { Publisher, OrderCreatedEvent, Subjects } from '@devsmash/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

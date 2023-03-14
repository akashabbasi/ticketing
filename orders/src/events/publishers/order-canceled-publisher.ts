import { Publisher, OrderCanceledEvent, Subjects } from '@devsmash/common';

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
}

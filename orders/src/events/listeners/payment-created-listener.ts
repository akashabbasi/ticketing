import { Subjects, Listener, PaymentCreatedEvent } from '@devsmash/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { OrderStatus } from '../../../../common/src/events/types/order-status';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order Not Found');
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}

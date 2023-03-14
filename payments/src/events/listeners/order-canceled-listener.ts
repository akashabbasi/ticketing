import {
  OrderCanceledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@devsmash/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCanceledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) throw new Error('Order not found');

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}

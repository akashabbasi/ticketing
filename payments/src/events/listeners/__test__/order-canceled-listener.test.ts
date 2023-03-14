import mongoose from 'mongoose';
import { OrderStatus, OrderCanceledEvent } from '@devsmash/common';
import { OrderCanceledListener } from '../order-canceled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCanceledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'asdf',
    version: 0,
  });
  await order.save();

  const data: OrderCanceledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdf',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('updates the status of order', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

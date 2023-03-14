import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
} from '@devsmash/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find ticket user trying to order in db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    // Make sure ticket not reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Tciket is already reserved');
    }
    // calculate expiration date of this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build an order save it in DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();
    // publish event saying order is created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status as OrderStatus,
      version: order.version,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };

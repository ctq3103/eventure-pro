import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	OrderStatus,
	TicketStatus,
	BadRequestError,
} from '@eventure/common';
import { body } from 'express-validator';
import { Event } from '../models/Event';
import { Order } from '../models/Order';
import { OrderCreatedPublisher } from '../NATS-events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 3 * 24 * 60 * 60; // 3 days

router.post(
	'/api/orders',
	requireAuth,
	[
		body('eventId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('Ticket ID must be provided'),
		body('numberOfTickets')
			.not()
			.isEmpty()
			.withMessage('Number of tickets must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { eventId, numberOfTickets } = req.body;

		//Find the ticket the user is trying to order
		const event = await Event.findById(eventId);
		if (!event) {
			throw new NotFoundError();
		}

		//Make sure that Ticket Status is Available (not SoldOut or EventEnded)
		if (
			event.status === TicketStatus.EventEnded ||
			event.status === TicketStatus.SoldOut
		) {
			throw new BadRequestError('This ticket is not available for purchase');
		}

		//Calculate the expiration date for the order
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		//Calculate Total Price = Price * Number Of Tickets
		const totalPrice = event.price * numberOfTickets;

		//Build the order and save it to the database
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			eventId: event.id,
			event,
			numberOfTickets,
			totalPrice,
		});
		await order.save();

		// Publish NATS event saying that the order was created
		const { id, userId, status, version, expiresAt } = order;
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id,
			userId,
			status,
			expiresAt: expiresAt.toISOString(),
			version,
			event: { id: event.id, price: event.price },
			totalPrice,
		});

		res.status(201).send(order);
	}
);

export { router as createOrderRouter };

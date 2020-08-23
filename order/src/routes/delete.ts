import express, { Request, Response } from 'express';
import {
	requireAuth,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
} from '@eventure/common';
import { Order } from '../models/Order';
import { OrderCancelledPublisher } from '../NATS-events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const { orderId } = req.params;
		const order = await Order.findById(orderId).populate('event');

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		order.status = OrderStatus.Cancelled;
		await order.save();

		new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			event: {
				id: order.event.id,
			},
		});

		res.status(204).send(order);
	}
);

export { router as deleteOrderRouter };

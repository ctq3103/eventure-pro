import express, { Request, Response } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
	BadRequestError,
} from '@eventure/common';
import { stripe } from '../stripe';
import { body } from 'express-validator';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { PaymentCreatedPublisher } from '../NATS-events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[
		body('token').not().isEmpty().withMessage('Token is required'),
		body('orderId').not().isEmpty().withMessage('Order ID is required'),
		body('eventId').not().isEmpty().withMessage('Event ID is required'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId, eventId } = req.body;
		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Order has been cancelled');
		}

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.totalPrice * 100,
			source: token,
		});

		const payment = Payment.build({
			eventId,
			orderId,
			stripeId: charge.id,
		});

		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			eventId: payment.eventId,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		res.status(201).send({ payment });
	}
);

export { router as createChargeRouter };

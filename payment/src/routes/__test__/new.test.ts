import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@eventure/common';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/Payment';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.getAuthCookie())
		.send({
			token: 'asldkfj',
			orderId: mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
		eventId: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		totalPrice: 20,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.getAuthCookie())
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const eventId = mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		eventId,
		version: 0,
		totalPrice: 20,
		status: OrderStatus.Cancelled,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.getAuthCookie(userId))
		.send({
			orderId: order.id,
			token: 'tok_visa',
		})
		.expect(400);
});

it('returns 204 with valid inputs', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const eventId = mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		eventId,
		version: 0,
		totalPrice: 20,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.getAuthCookie(userId))
		.send({
			eventId: order.eventId,
			orderId: order.id,
			token: 'tok_visa',
		})
		.expect(201);

	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	expect(chargeOptions.source).toEqual('tok_visa');
	expect(chargeOptions.amount).toEqual(20 * 100);
	expect(chargeOptions.currency).toEqual('usd');

	const payment = await Payment.findOne({
		eventId: order.eventId,
		orderId: order.id,
		stripeId: chargeOptions.id,
	});
	expect(payment).not.toBeNull();
});

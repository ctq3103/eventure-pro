import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Event } from '../../models/Event';
import { Order } from '../../models/Order';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@eventure/common';

it('marks an order as cancelled', async () => {
	// create a event with event Model
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await event.save();

	const user = global.getAuthCookie();
	// make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ eventId: event.id, numberOfTickets: 5 })
		.expect(201);

	// make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204);

	// expectation to make sure the thing is cancelled
	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Machine Learning',
		price: 200,
	});
	await event.save();

	const user = global.getAuthCookie();

	// make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ eventId: event.id, numberOfTickets: 5 })
		.expect(201);

	// make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

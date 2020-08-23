import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Event } from '../../models/Event';

it('fetches the order', async () => {
	// Create a ticket
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'asdfghjkl',
		price: 20,
	});
	await event.save();

	const user = global.getAuthCookie();
	// make a request to build an order with this event
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ eventId: event.id, numberOfTickets: 5 })
		.expect(201);

	// make request to fetch the order
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(200);

	expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
	// Create a event
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await event.save();

	const user = global.getAuthCookie();
	// make a request to build an order with this event
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ eventId: event.id, numberOfTickets: 10 })
		.expect(201);

	// make request to fetch the order
	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', global.getAuthCookie())
		.send()
		.expect(401);
});

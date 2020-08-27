import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { Event } from '../../models/Event';
import { TicketStatus } from '@eventure/common';

const buildEvent = async () => {
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
		status: TicketStatus.Available,
	});
	await event.save();

	return event;
};

it('fetches orders for an particular user', async () => {
	// Create three Events
	const eventOne = await buildEvent();
	const eventTwo = await buildEvent();
	const eventThree = await buildEvent();

	const userOne = global.getAuthCookie();
	const userTwo = global.getAuthCookie();
	// Create one order as User #1
	await request(app)
		.post('/api/orders')
		.set('Cookie', userOne)
		.send({ eventId: eventOne.id, numberOfTickets: 5 })
		.expect(201);

	// Create two orders as User #2
	const { body: orderOne } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ eventId: eventTwo.id, numberOfTickets: 5 })
		.expect(201);
	const { body: orderTwo } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ eventId: eventThree.id, numberOfTickets: 10 })
		.expect(201);

	// Make request to get orders for User #2
	const response = await request(app)
		.get('/api/orders')
		.set('Cookie', userTwo)
		.expect(200);

	// Make sure we only got the orders for User #2
	expect(response.body.length).toEqual(2);
	expect(response.body[0].id).toEqual(orderOne.id);
	expect(response.body[1].id).toEqual(orderTwo.id);
	expect(response.body[0].event.id).toEqual(eventTwo.id);
	expect(response.body[1].event.id).toEqual(eventThree.id);
});

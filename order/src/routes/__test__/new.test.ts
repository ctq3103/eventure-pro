import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Event } from '../../models/Event';
import { natsWrapper } from '../../nats-wrapper';
import { TicketStatus } from '@eventure/common';

it('returns an error if the event does not exist', async () => {
	const eventId = mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.getAuthCookie())
		.send({ eventId, numberOfTickets: 2 })
		.expect(404);
});

it('return an error if user is trying to purchase an event that is not available', async () => {
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'pikachu',
		status: TicketStatus.SoldOut,
		price: 20,
	});
	await event.save();

	const response = await request(app)
		.post('/api/orders')
		.set('Cookie', global.getAuthCookie())
		.send({ eventId: event.id, numberOfTickets: 2 })
		.expect(400);
});

it('successfully creates an order', async () => {
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'pikachu',
		status: TicketStatus.Available,
		price: 20,
	});
	await event.save();

	const response = await request(app)
		.post('/api/orders')
		.set('Cookie', global.getAuthCookie())
		.send({ eventId: event.id, numberOfTickets: 2 })
		.expect(201);
});

it('emits an order created event', async () => {
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Business',
		price: 200,
		status: TicketStatus.Available,
	});
	await event.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.getAuthCookie())
		.send({ eventId: event.id, numberOfTickets: 20 })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

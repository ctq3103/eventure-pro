import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Event } from '../../models/Event';
import { natsWrapper } from '../../nats-wrapper';
import { TicketStatus } from '@eventure/common';

const title = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';
const datetime = new Date('2021-01-01T18:00:00');
const price = 50;
const totalTickets = 50;
const status = TicketStatus.Available;
const organizationId = mongoose.Types.ObjectId().toHexString();

it('has a route handler listening to /api/events for post request', async () => {
	const response = await request(app).post('/api/events').send({});

	expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/events').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
	const response = await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({});
	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid Title is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: '',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if an invalid Price is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime,
			status,
			organizationId,
			totalTickets,
			price: -10,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if an invalid Total Tickets is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime,
			status,
			organizationId,
			totalTickets: -50,
			price,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime,
			status,
			organizationId,
			price,
		})
		.expect(400);
});

it('returns an error if an invalid Description is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description: '    ',
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if an invalid Address is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address: '  ',
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if an invalid datetime is provided', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime: '',
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime: '1234567',
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if all fields are invalid', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: '',
			description: '',
			address: '',
			datetime: '',
			price: '',
			status,
		})
		.expect(400);
});

it('creates an events with valid input', async () => {
	let events = await Event.find({});
	expect(events.length).toEqual(0);

	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});

	events = await Event.find({});
	expect(events.length).toEqual(1);
	expect(events[0].title).toEqual(title);
});

it('publishes NATS event', async () => {
	let events = await Event.find({});
	expect(events.length).toEqual(0);

	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title,
			description,
			address,
			price,
			status,
			datetime,
			organizationId,
			totalTickets,
		});

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

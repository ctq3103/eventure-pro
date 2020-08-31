import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { TicketStatus } from '@eventure/common';

const title = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';
const datetime = new Date('2021-01-01T18:00:00');
const price = 50;
const totalTickets = 50;
const organizationId = mongoose.Types.ObjectId().toHexString();
const status = TicketStatus.Available;

it('returns a 404 if the provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/events/${id}`)
		.set('Cookie', global.getAuthCookie())
		//.attach('photo', '../../img/event.jpg')
		.send({
			title,
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/events/${id}`)
		.send({
			title,
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
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
	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut---2',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(401);
});

it('returns a 400 if the user provides an invalid title', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
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
});

it('returns a 400 if the user provides an invalid price', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title,
			description,
			address,
			datetime,
			price: -50,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns a 400 if the user provides an invalid Description', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title,
			description: '',
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns a 400 if the user provides an invalid Address', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title,
			description,
			address: '',
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(400);
});

it('returns an error if an invalid datetime is provided', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
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
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
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
});

it('updates the ticket provided valid inputs', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'non diam phasellus vestibulum lorem',
			description:
				'condimentum mattis pellentesque id nibh tortor id aliquet lectus proin nibh nisl condimentum id venenatis a condimentum vitae sapien pellentesque',
			address: '23 Jump Street',
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(200);

	const eventResponse = await request(app)
		.get(`/api/events/${response.body.id}`)
		.send();

	expect(eventResponse.body.title).toEqual(
		'non diam phasellus vestibulum lorem'
	);
});

it('publishes NATS event', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/events')
		.set('Cookie', cookie)
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

	await request(app)
		.put(`/api/events/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title,
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

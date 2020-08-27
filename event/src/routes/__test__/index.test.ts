import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { TicketStatus } from '@eventure/common';

const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';
const datetime = new Date('2021-01-01T18:00:00');
const price = 50;
const totalTickets = 50;
const status = TicketStatus.Available;
const organizationId = mongoose.Types.ObjectId().toHexString();

it('fetch a list of events', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 1',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 2',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 3',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});

	const response = await request(app).get('/api/events').send().expect(200);

	expect(response.body.length).toEqual(3);
});

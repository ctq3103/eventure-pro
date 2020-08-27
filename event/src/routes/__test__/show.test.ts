import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
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

it('returns a 404 if the event is not found', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app).get(`/api/events/${id}`).send().expect(404);
});

it('returns the event if the event is found', async () => {
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
		})
		.expect(201);

	const eventResponse = await request(app)
		.get(`/api/events/${response.body.id}`)
		.send()
		.expect(200);

	expect(eventResponse.body.title).toEqual(title);
	expect(eventResponse.body.description).toEqual(description);
	expect(eventResponse.body.address).toEqual(address);
});

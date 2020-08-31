import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
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

it('upload image for event', async () => {
	const cookie = global.getAuthCookie();

	const { body: event } = await request(app)
		.post(`/api/events`)
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
		.expect(201);

	const response = await request(app)
		.put(`/api/events/${event.id}/photo`)
		.set('Cookie', cookie)
		.attach('image', __dirname + '../../../image/event.jpg')
		.expect(200);

	expect(response.body.image.name).not.toBeNull();
});

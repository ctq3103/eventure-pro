import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Event } from '../../models/Event';
import { TicketStatus } from '@eventure/common';

const name = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';

it('returns a 404 if the organization is not found', async () => {
	const id = mongoose.Types.ObjectId().toHexString();

	await request(app).get(`/api/organizations/${id}/events`).send().expect(404);
});

it('returns all events of the organization if the organization is found', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie(userId))
		.send({
			name,
			description,
			address,
		})
		.expect(201);

	const organizationId = response.body.id;

	// Create and save an event
	const eventOne = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'test-one',
		datetime: new Date('2021-11-11T00:09:30.000Z'),
		price: 100,
		status: TicketStatus.Available,
		userId,
		organizationId,
	});
	await eventOne.save();

	const eventTwo = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'test-two',
		datetime: new Date('2021-11-15T00:09:30.000Z'),
		price: 100,
		status: TicketStatus.Available,
		userId,
		organizationId,
	});
	await eventTwo.save();

	const eventThree = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'test-three',
		datetime: new Date('2021-11-16T00:09:30.000Z'),
		price: 100,
		status: TicketStatus.Available,
		userId,
		organizationId,
	});
	await eventThree.save();

	const eventsResponse = await request(app)
		.get(`/api/organizations/${organizationId}/events`)
		.send()
		.expect(200);
	expect(eventsResponse.body.count).toEqual(3);
});

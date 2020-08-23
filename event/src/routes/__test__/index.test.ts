import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';
const datetime = new Date('2021-01-01T18:00:00');
const price = 50;

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
		});

	const response = await request(app).get('/api/events').send().expect(200);

	expect(response.body.length).toEqual(3);
});

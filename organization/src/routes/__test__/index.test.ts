import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

it('fetch a list of organizations', async () => {
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name: 'Ornare arcu odio ut 1',
			description:
				'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.',
			address: '22 Jump Street',
		});
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name: 'Ornare arcu odio ut 2',
			description:
				'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.',
			address: '22 Jump Street',
		});
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name: 'Ornare arcu odio ut 3',
			description:
				'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.',
			address: '22 Jump Street',
		});

	const response = await request(app)
		.get('/api/organizations')
		.send()
		.expect(200);

	expect(response.body.length).toEqual(3);
});

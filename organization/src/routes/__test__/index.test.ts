import mongoose from 'mongoose';
import request from 'supertest';
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

	expect(response.body.count).toEqual(3);
});

it('fetch a list of organizations with correct page and limit', async () => {
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
		.get('/api/organizations?page=2&limit=2')
		.send()
		.expect(200);

	expect(response.body.count).toEqual(1);
	expect(response.body.data[0].name).toEqual('Ornare arcu odio ut 3');
});

it('fetch a list of organizations with selected or sorted fields', async () => {
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
		.get('/api/organizations?select=title')
		.send()
		.expect(200);

	expect(response.body.count).toEqual(3);
	expect(response.body.data[0].description).not.toBeDefined();
});

import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

const name = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';

it('returns a 404 if the provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/organizations/${id}`)
		.set('Cookie', global.getAuthCookie())
		.send({ name, description, address })
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/organizations/${id}`)
		.send({ name, description, address })
		.expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({ name, description, address });
	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', global.getAuthCookie())
		.send({ name: 'Ornare arcu odio ut---2', description, address })
		.expect(401);
});

it('returns a 400 if the user provides an invalid Name', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', cookie)
		.send({ name, description, address });

	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			name: '',
			description,
			address,
		})
		.expect(400);
	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			description,
			address,
		})
		.expect(400);
});

it('returns a 400 if the user provides an invalid Description', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', cookie)
		.send({ name, description, address });

	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			name,
			description: '',
			address,
		})
		.expect(400);
});

it('returns a 400 if the user provides an invalid Address', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', cookie)
		.send({ name, description, address });

	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			name,
			description,
			address: '',
		})
		.expect(400);
});

it('updates the ticket provided valid inputs', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', cookie)
		.send({ name, description, address });

	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			name: 'non diam phasellus vestibulum lorem',
			description:
				'condimentum mattis pellentesque id nibh tortor id aliquet lectus proin nibh nisl condimentum id venenatis a condimentum vitae sapien pellentesque',
			address: '23 Jump Street',
		})
		.expect(200);

	const orgResponse = await request(app)
		.get(`/api/organizations/${response.body.id}`)
		.send();

	expect(orgResponse.body.name).toEqual('non diam phasellus vestibulum lorem');
});

it('publishes NATS event', async () => {
	const cookie = global.getAuthCookie();

	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', cookie)
		.send({ name, description, address });

	await request(app)
		.put(`/api/organizations/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			name: 'non diam phasellus vestibulum lorem',
			description:
				'condimentum mattis pellentesque id nibh tortor id aliquet lectus proin nibh nisl condimentum id venenatis a condimentum vitae sapien pellentesque',
			address: '23 Jump Street',
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

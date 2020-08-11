import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

const name = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';

it('returns a 404 if the organization is not found', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app).get(`/api/organizations/${id}`).send().expect(404);
});

it('returns the organization if the organization is found', async () => {
	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			description,
			address,
		})
		.expect(201);

	const orgResponse = await request(app)
		.get(`/api/organizations/${response.body.id}`)
		.send()
		.expect(200);

	expect(orgResponse.body.name).toEqual(name);
	expect(orgResponse.body.description).toEqual(description);
	expect(orgResponse.body.address).toEqual(address);
});

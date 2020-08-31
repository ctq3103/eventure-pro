import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

const name = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';

it('upload logo for organization', async () => {
	const cookie = global.getAuthCookie();

	const { body: organization } = await request(app)
		.post(`/api/organizations`)
		.set('Cookie', cookie)
		.send({
			name,
			description,
			address,
		})
		.expect(201);

	const response = await request(app)
		.put(`/api/organizations/${organization.id}/photo`)
		.set('Cookie', cookie)
		.attach('image', __dirname + '../../../logo/logo.png')
		.expect(200);

	expect(response.body.image.name).not.toBeNull();
});

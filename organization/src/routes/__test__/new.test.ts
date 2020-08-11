import request from 'supertest';
import { app } from '../../app';
import { Organization } from '../../models/Organization';

const name = 'Ornare arcu odio ut';
const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';

it('has a route handler listening to /api/organizations for post request', async () => {
	const response = await request(app).post('/api/organizations').send({});

	expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/organizations').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
	const response = await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({});
	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid Name is provided', async () => {
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name: '',
			description,
			address,
		})
		.expect(400);
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			description,
			address,
		})
		.expect(400);
});

it('returns an error if an invalid Description is provided', async () => {
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			description: '    ',
			address,
		})
		.expect(400);
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			address,
		})
		.expect(400);
});

it('returns an error if an invalid Address is provided', async () => {
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			description,
			address: '  ',
		})
		.expect(400);
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			description,
		})
		.expect(400);
});

it('returns an error if all fields are invalid', async () => {
	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name: '',
			description: '',
			address: '',
		})
		.expect(400);
});

it('creates an organization with valid input', async () => {
	let organizations = await Organization.find({});
	expect(organizations.length).toEqual(0);

	await request(app)
		.post('/api/organizations')
		.set('Cookie', global.getAuthCookie())
		.send({
			name,
			description,
			address,
		});

	organizations = await Organization.find({});
	expect(organizations.length).toEqual(1);
	expect(organizations[0].name).toEqual(name);
});

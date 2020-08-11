import request from 'supertest';
import { app } from '../../app';

it('returns a 200 on successful signin', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200);
});

it('returns a 400 with missing email and password', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: '',
			password: '',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signin')
		.send({
			email: '',
			password: 'password',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: '',
		})
		.expect(400);
});

it('fails when email does not exist', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('fails when password is incorrect', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'pas',
		})
		.expect(400);
});

it('sets a cookie after successful signin', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);

	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200);

	expect(response.get('Set-Cookie')).toBeDefined();
});

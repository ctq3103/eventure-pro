import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);
});

it('returns a 400 with an invalid email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(400);
});

it('returns a 400 with no email and passwords', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: '',
			password: '',
			passwordConfirmation: '',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '',
			passwordConfirmation: '',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signup')
		.send({
			email: '',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(400);
});

it('returns a 400 when Passwords do not match', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: '',
		})
		.expect(400);
});

it('returns a 400 invalid passwords', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'pa',
			passwordConfirmation: 'pa',
		})
		.expect(400);
});

it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);

	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(400);
});

it('sets a cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
			passwordConfirmation: 'password',
		})
		.expect(201);

	expect(response.get('Set-Cookie')).toBeDefined();
});

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { TicketStatus } from '@eventure/common';

const description =
	'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.';
const address = '22 Jump Street';
const datetime = new Date('2021-01-01T18:00:00');
const price = 50;
const totalTickets = 50;
const status = TicketStatus.Available;
const organizationId = mongoose.Types.ObjectId().toHexString();

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
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 2',
			description,
			address,
			datetime,
			price: 60,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 3',
			description,
			address,
			datetime,
			price: 70,
			status: TicketStatus.SoldOut,
			organizationId,
			totalTickets,
		});

	const response = await request(app).get('/api/events').send().expect(200);

	const responsePrice = await request(app)
		.get('/api/events?price[gt]=50')
		.send()
		.expect(200);
	const responseStatus = await request(app)
		.get('/api/events?status=soldout')
		.send()
		.expect(200);

	expect(response.body.count).toEqual(3);
	expect(responsePrice.body.count).toEqual(2);
	expect(responseStatus.body.count).toEqual(1);
});

it('fetch a list of events with selected or sorted fields', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 1',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 2',
			description,
			address,
			datetime,
			price: 100,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 3',
			description,
			address,
			datetime,
			price: 200,
			status: TicketStatus.SoldOut,
			organizationId,
			totalTickets,
		});

	const responseSelect = await request(app)
		.get('/api/events?select=title,price&status=soldout')
		.send()
		.expect(200);
	const responseSort = await request(app)
		.get('/api/events?sort=price')
		.send()
		.expect(200);

	expect(responseSelect.body.count).toEqual(1);
	expect(responseSelect.body.data[0].address).not.toBeDefined();
	expect(responseSelect.body.data[0].description).not.toBeDefined();
	expect(responseSelect.body.data[0].datetime).not.toBeDefined();

	expect(responseSort.body.data[0].title).toEqual('Ornare arcu odio ut 1');
});

it('fetch a list of events with correct page and limit', async () => {
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 1',
			description,
			address,
			datetime,
			price,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 2',
			description,
			address,
			datetime,
			price: 100,
			status,
			organizationId,
			totalTickets,
		});
	await request(app)
		.post('/api/events')
		.set('Cookie', global.getAuthCookie())
		.send({
			title: 'Ornare arcu odio ut 3',
			description,
			address,
			datetime,
			price: 200,
			status: TicketStatus.SoldOut,
			organizationId,
			totalTickets,
		});

	const response = await request(app)
		.get('/api/events?page=2&limit=2')
		.send()
		.expect(200);

	expect(response.body.count).toEqual(1);
	expect(response.body.data[0].title).toEqual('Ornare arcu odio ut 3');
});

import nats from 'node-nats-streaming';
import { EventCreatedPublisher } from './nats-events/event-created-publisher';

console.clear();
const stan = nats.connect('eventure', 'abc', {
	url: 'http://localhost:4222',
});

stan.on('connect', async () => {
	console.log('Publisher connected to NATS');

	const publisher = new EventCreatedPublisher(stan);
	await publisher.publish({
		id: '123',
		name: 'name',
		description: 'description',
		address: 'address',
		date: new Date(2021, 0, 1, 19, 30),
		price: 20,
	});

	// const data = JSON.stringify({
	// 	id: '123',
	// 	title: 'concert',
	// 	price: 20,
	// });

	// stan.publish('event:created', data, () => {
	// 	console.log('EventCreated published');
	// });
});

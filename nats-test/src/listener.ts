import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { EventCreatedListener } from './nats-events/event-created-listener';

console.clear();
const stan = nats.connect('eventure', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4222',
});

stan.on('connect', () => {
	console.log('Listener connected to NATS');

	stan.on('close', () => {
		console.log('NATS connection closed');
		process.exit();
	});

	new EventCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close()); //interupt signal
process.on('SIGTERM', () => stan.close()); //terminate signal

import nats, { Message, Stan } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { EventCreatedEvent } from './event-created-events';
import { Subjects } from './subjects';

export class EventCreatedListener extends Listener<EventCreatedEvent> {
	readonly subject = Subjects.EventCreated;
	queueGroupName = 'payments-service';
	onMessage(data: EventCreatedEvent['data'], msg: Message) {
		console.log('Event data!', data);
		msg.ack();
	}
}

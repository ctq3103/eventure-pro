import { Message } from 'node-nats-streaming';
import { Subjects, Listener, EventCreatedEvent } from '@eventure/common';
import { Event } from '../../models/Event';
import { queueGroupName } from './queue-group-name';

export class EventCreatedListener extends Listener<EventCreatedEvent> {
	subject: Subjects.EventCreated = Subjects.EventCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventCreatedEvent['data'], msg: Message) {
		const { id, title, price, status } = data;
		const event = Event.build({
			id,
			title,
			price,
			status,
		});
		await event.save();

		msg.ack();
	}
}

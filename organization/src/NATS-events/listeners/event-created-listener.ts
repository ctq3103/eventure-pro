import { EventCreatedEvent, Subjects, Listener } from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';

export class EventCreatedListener extends Listener<EventCreatedEvent> {
	readonly subject = Subjects.EventCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventCreatedEvent['data'], msg: Message) {
		const { id, title, price, datetime, status, organizationId, userId } = data;
		const event = Event.build({
			title,
			price,
			datetime: new Date(datetime),
			status,
			organizationId,
			userId,
			id,
		});
		await event.save();
		msg.ack();
	}
}

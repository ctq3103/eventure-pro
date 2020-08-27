import { Listener, EventUpdatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';

export class EventUpdatedListener extends Listener<EventUpdatedEvent> {
	readonly subject = Subjects.EventUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventUpdatedEvent['data'], msg: Message) {
		const event = await Event.findByNatsEvent(data);

		if (!event) {
			throw new Error('Event not found');
		}
		const { title, price, datetime, status } = data;
		event.set({ title, price, datetime: new Date(datetime), status });
		await event.save();

		msg.ack();
	}
}

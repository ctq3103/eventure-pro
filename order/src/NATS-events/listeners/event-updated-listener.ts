import {
	Listener,
	EventUpdatedEvent,
	Subjects,
	TicketStatus,
} from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class EventUpdatedListener extends Listener<EventUpdatedEvent> {
	readonly subject = Subjects.EventUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventUpdatedEvent['data'], msg: Message) {
		const event = await Event.findByNatsEvent(data);

		if (!event) {
			throw new Error('Event not found');
		}

		const { title, price, status } = data;
		event.set({ title, price, status });
		await event.save();

		msg.ack();
	}
}

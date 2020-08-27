import {
	Listener,
	EventExpiredEvent,
	Subjects,
	OrderStatus,
	TicketStatus,
} from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';
import { EventUpdatedPublisher } from '../publishers/event-updated-publisher';

export class EventExpiredListener extends Listener<EventExpiredEvent> {
	readonly subject = Subjects.EventExpired;
	queueGroupName = queueGroupName;

	async onMessage(data: EventExpiredEvent['data'], msg: Message) {
		const event = await Event.findById(data.eventId);

		if (!event) {
			throw new Error('Event not found');
		}

		event.set({
			status: TicketStatus.EventEnded,
		});
		await event.save();

		const {
			id,
			title,
			address,
			datetime,
			price,
			status,
			userId,
			organizationId,
			version,
		} = event;

		await new EventUpdatedPublisher(this.client).publish({
			id,
			title,
			address,
			datetime: datetime.toISOString(),
			price,
			status,
			userId,
			organizationId,
			version,
		});

		msg.ack();
	}
}

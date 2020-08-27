import {
	Listener,
	EventUpdatedEvent,
	Subjects,
	NotFoundError,
} from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';
import { eventExpiredQueue } from '../../queues/event-expired-queue';

export class EventUpdatedListener extends Listener<EventUpdatedEvent> {
	readonly subject = Subjects.EventUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventUpdatedEvent['data'], msg: Message) {
		const event = await Event.findById(data.id);
		if (!event) {
			throw new NotFoundError();
		}
		event.set({ datetime: data.datetime });
		await event.save();

		const delay = new Date(event.datetime).getTime() - new Date().getTime();
		console.log(`EventExpired: Waiting ${delay} to process the job`);

		await eventExpiredQueue.add(
			{
				eventId: event.id,
			},
			{
				delay,
			}
		);

		msg.ack();
	}
}

import { Listener, EventCreatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';
import { eventExpiredQueue } from '../../queues/event-expired-queue';

export class EventCreatedListener extends Listener<EventCreatedEvent> {
	readonly subject = Subjects.EventCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: EventCreatedEvent['data'], msg: Message) {
		const event = Event.build({
			id: data.id,
			datetime: data.datetime,
			status: data.status,
		});
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

import { Listener, PaymentCreatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Event } from '../../models/Event';
import { EventUpdatedPublisher } from '../publishers/event-updated-publisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		// Find the event that user has purchased the ticket
		const event = await Event.findById(data.eventId);

		// If no event, throw error
		if (!event) {
			throw new Error('Event not found');
		}

		// Add Id of this completed order to orderCompletedIds list
		event.paymentIds.push(data.id);

		//save the event
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

		//ack the message
		msg.ack();
	}
}

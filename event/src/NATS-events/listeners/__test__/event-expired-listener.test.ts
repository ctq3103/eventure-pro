import { natsWrapper } from '../../../nats-wrapper';
import { Event } from '../../../models/Event';
import mongoose from 'mongoose';
import { OrderStatus, EventExpiredEvent, TicketStatus } from '@eventure/common';
import { Message } from 'node-nats-streaming';
import { EventExpiredListener } from '../event-expired-listener';

const setup = async () => {
	const listener = new EventExpiredListener(natsWrapper.client);

	const event = Event.build({
		title: 'test title',
		price: 50,
		status: TicketStatus.Available,
		description:
			'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.',
		address: '22 Jump Street',
		datetime: new Date('2021-01-01T18:00:00'),
		totalTickets: 50,
		organizationId: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	await event.save();

	const data: EventExpiredEvent['data'] = {
		eventId: event.id,
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, event, data, msg };
};

it('updates the ticket status to event ended', async () => {
	const { listener, event, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedEvent = await Event.findById(event.id);

	expect(updatedEvent!.status).toEqual(TicketStatus.EventEnded);
});

it('emits an EventUpdated event', async () => {
	const { listener, event, data, msg } = await setup();
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('acks the message', async () => {
	const { listener, event, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

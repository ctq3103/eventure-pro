import { PaymentCreatedListener } from '../payment-created-listener';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Event } from '../../../models/Event';
import { TicketStatus, PaymentCreatedEvent } from '@eventure/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new PaymentCreatedListener(natsWrapper.client);

	const event = Event.build({
		title: 'Ornare arcu odio ut',
		description:
			'Praesent eget fermentum nisl. Nulla lectus diam, dapibus nec suscipit.',
		address: '22 Jump Street',
		datetime: new Date('2021-01-01T18:00:00'),
		price: 50,
		totalTickets: 2,
		status: TicketStatus.Available,
		organizationId: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	await event.save();

	const dataOne: PaymentCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		eventId: event.id,
		orderId: mongoose.Types.ObjectId().toHexString(),
		stripeId: mongoose.Types.ObjectId().toHexString(),
	};
	const dataTwo: PaymentCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		eventId: event.id,
		orderId: mongoose.Types.ObjectId().toHexString(),
		stripeId: mongoose.Types.ObjectId().toHexString(),
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, event, dataOne, dataTwo, msg };
};

it('adds the new payment ID to paymentIds list', async () => {
	const { listener, event, dataOne, msg } = await setup();

	await listener.onMessage(dataOne, msg);
	const updatedEvent = await Event.findById(event.id);

	expect(updatedEvent!.paymentIds.length).toEqual(1);
	expect(updatedEvent!.paymentIds[0]).toEqual(dataOne.id);
});

it('updates event status to Sold Out if tickets are sold out', async () => {
	const { listener, event, dataOne, dataTwo, msg } = await setup();

	await listener.onMessage(dataOne, msg);
	await listener.onMessage(dataTwo, msg);

	const updatedEvent = await Event.findById(event.id);
	expect(updatedEvent!.paymentIds.length).toEqual(2);
	expect(updatedEvent!.status).toEqual(TicketStatus.SoldOut);
});

it('acks the message', async () => {
	const { listener, dataOne, msg } = await setup();
	await listener.onMessage(dataOne, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('publishes event updated NATS event', async () => {
	const { listener, dataOne, msg } = await setup();
	await listener.onMessage(dataOne, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

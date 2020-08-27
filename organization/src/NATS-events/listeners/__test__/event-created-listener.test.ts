import { EventCreatedEvent, TicketStatus } from '@eventure/common';
import { EventCreatedListener } from '../event-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Event } from '../../../models/Event';

const setup = async () => {
	// Create an instance of the listener
	const listener = new EventCreatedListener(natsWrapper.client);
	// Create a fake data event
	const data: EventCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		title: 'test',
		address: 'test address',
		datetime: '2021-11-11T00:09:30.000Z',
		price: 100,
		status: TicketStatus.Available,
		userId: mongoose.Types.ObjectId().toHexString(),
		organizationId: mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('creates and saves an event', async () => {
	const { listener, data, msg } = await setup();

	// Call the on Message Function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure an event was created
	const event = await Event.findById(data.id);

	expect(event).toBeDefined();
	expect(event!.title).toEqual(data.title);
	expect(event!.price).toEqual(data.price);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();

	// Call the on Message Function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure ack function is called
	expect(msg.ack).toHaveBeenCalled();
});

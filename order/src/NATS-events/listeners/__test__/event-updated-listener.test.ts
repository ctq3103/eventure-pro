import { EventUpdatedListener } from '../event-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { EventUpdatedEvent, TicketStatus } from '@eventure/common';
import mongoose from 'mongoose';
import { Event } from '../../../models/Event';

const setup = async () => {
	// Create an instance of the listener
	const listener = new EventUpdatedListener(natsWrapper.client);

	// Create and save an event
	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'test',
		status: TicketStatus.Available,
		price: 100,
	});
	await event.save();

	// Create a fake data event
	const data: EventUpdatedEvent['data'] = {
		id: event.id,
		version: event.version + 1,
		title: 'test updated',
		address: 'test address',
		datetime: '2021-11-11T00:09:30.000Z',
		price: 500,
		status: TicketStatus.Available,
		userId: mongoose.Types.ObjectId().toHexString(),
		organizationId: mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, event };
};

it('finds, updates and saves an event', async () => {
	const { listener, data, msg, event } = await setup();

	await listener.onMessage(data, msg);

	const updatedEvent = await Event.findById(event.id);
	expect(updatedEvent!.title).toEqual(data.title);
	expect(updatedEvent!.price).toEqual(data.price);
	expect(updatedEvent!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { listener, data, msg, event } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
	const { listener, data, msg, event } = await setup();
	data.version = 1000;

	try {
		await listener.onMessage(data, msg);
	} catch (err) {}
	expect(msg.ack).not.toHaveBeenCalled();
});

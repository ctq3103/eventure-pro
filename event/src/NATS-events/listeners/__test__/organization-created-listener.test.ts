import { OrganizationCreatedEvent } from '@eventure/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrganizationCreatedListener } from '../organization-created-listener';
import { Organization } from '../../../models/Organization';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrganizationCreatedListener(natsWrapper.client);
	// Create a fake data event
	const data: OrganizationCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		name: 'test',
		address: 'test address',
		description: 'test description',
		userId: mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('creates and saves an organization', async () => {
	const { listener, data, msg } = await setup();

	// Call the on Message Function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure an event was created
	const org = await Organization.findById(data.id);

	expect(org).toBeDefined();
	expect(org!.name).toEqual(data.name);
	expect(org!.description).toEqual(data.description);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();

	// Call the on Message Function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure ack function is called
	expect(msg.ack).toHaveBeenCalled();
});

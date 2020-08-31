import { natsWrapper } from '../../../nats-wrapper';
import { OrganizationCreatedEvent } from '@eventure/common';
import mongoose from 'mongoose';
import { Organization } from '../../../models/Organization';
import { OrganizationUpdatedListener } from '../organization-updated-listener';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrganizationUpdatedListener(natsWrapper.client);

	const id = mongoose.Types.ObjectId().toHexString();

	// Create and save an event
	const org = Organization.build({
		id,
		name: 'test old',
		address: 'test old address',
		description: 'test old description',
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	await org.save();

	// Create a fake data event
	const data: OrganizationCreatedEvent['data'] = {
		id,
		version: org.version + 1,
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

	return { listener, data, msg, org };
};

it('finds, updates and saves an organization', async () => {
	const { listener, data, msg, org } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrganization = await Organization.findById(org.id);
	expect(updatedOrganization!.name).toEqual(data.name);
	expect(updatedOrganization!.description).toEqual(data.description);
	expect(updatedOrganization!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the organization has a skipped version number', async () => {
	const { listener, data, msg } = await setup();
	data.version = 1000;

	try {
		await listener.onMessage(data, msg);
	} catch (err) {}
	expect(msg.ack).not.toHaveBeenCalled();
});

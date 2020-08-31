import { Listener, OrganizationUpdatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Organization } from '../../models/Organization';

export class OrganizationUpdatedListener extends Listener<
	OrganizationUpdatedEvent
> {
	readonly subject = Subjects.OrganizationUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrganizationUpdatedEvent['data'], msg: Message) {
		const org = await Organization.findByNatsEvent(data);

		if (!org) {
			throw new Error('Organization not found');
		}
		const { id, name, address, description, userId } = data;
		org.set({ id, name, address, description, userId });
		await org.save();

		msg.ack();
	}
}

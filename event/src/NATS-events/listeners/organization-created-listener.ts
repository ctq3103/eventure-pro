import { OrganizationCreatedEvent, Subjects, Listener } from '@eventure/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Organization } from '../../models/Organization';

export class OrganizationCreatedListener extends Listener<
	OrganizationCreatedEvent
> {
	readonly subject = Subjects.OrganizationCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrganizationCreatedEvent['data'], msg: Message) {
		const { id, name, address, description, userId } = data;
		const organization = Organization.build({
			id,
			name,
			address,
			description,
			userId,
		});
		await organization.save();
		msg.ack();
	}
}

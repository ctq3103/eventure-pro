import {
	OrganizationCreatedEvent,
	Publisher,
	Subjects,
} from '@eventure/common';

export class OrganizationCreatedPublisher extends Publisher<
	OrganizationCreatedEvent
> {
	readonly subject = Subjects.OrganizationCreated;
}

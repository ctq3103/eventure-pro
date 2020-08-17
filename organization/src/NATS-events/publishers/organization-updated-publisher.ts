import {
	OrganizationUpdatedEvent,
	Publisher,
	Subjects,
} from '@eventure/common';

export class OrganizationUpdatedPublisher extends Publisher<
	OrganizationUpdatedEvent
> {
	readonly subject = Subjects.OrganizationUpdated;
}

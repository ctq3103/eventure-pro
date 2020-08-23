import { EventUpdatedEvent, Subjects, Publisher } from '@eventure/common';

export class EventUpdatedPublisher extends Publisher<EventUpdatedEvent> {
	readonly subject = Subjects.EventUpdated;
}

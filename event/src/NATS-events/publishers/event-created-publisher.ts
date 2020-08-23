import { EventCreatedEvent, Subjects, Publisher } from '@eventure/common';

export class EventCreatedPublisher extends Publisher<EventCreatedEvent> {
	readonly subject = Subjects.EventCreated;
}

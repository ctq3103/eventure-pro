import { Publisher } from './base-publisher';
import { EventCreatedEvent } from './event-created-events';
import { Subjects } from './subjects';

export class EventCreatedPublisher extends Publisher<EventCreatedEvent> {
	subject: Subjects.EventCreated = Subjects.EventCreated;
}

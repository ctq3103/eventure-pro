import { EventExpiredEvent, Publisher, Subjects } from '@eventure/common';

export class EventExpiredPublisher extends Publisher<EventExpiredEvent> {
	readonly subject = Subjects.EventExpired;
}

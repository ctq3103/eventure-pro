import { Publisher, OrderCompletedEvent, Subjects } from '@eventure/common';

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
	readonly subject = Subjects.OrderCompleted;
}

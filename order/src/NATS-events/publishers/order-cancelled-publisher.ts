import { OrderCancelledEvent, Subjects, Publisher } from '@eventure/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}

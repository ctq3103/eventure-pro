import { OrderCreatedEvent, Subjects, Publisher } from '@eventure/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}

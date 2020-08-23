import { OrderCreatedEvent, Subjects, Publisher } from '@eventure/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

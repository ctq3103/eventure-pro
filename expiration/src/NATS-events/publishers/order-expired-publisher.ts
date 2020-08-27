import { Publisher, OrderExpiredEvent, Subjects } from '@eventure/common';

export class OrderExpiredPublisher extends Publisher<OrderExpiredEvent> {
	readonly subject = Subjects.OrderExpired;
}

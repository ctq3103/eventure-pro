import { Publisher, PaymentCreatedEvent, Subjects } from '@eventure/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}

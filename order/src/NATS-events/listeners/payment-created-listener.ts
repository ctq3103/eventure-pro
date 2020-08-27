import {
	Listener,
	PaymentCreatedEvent,
	Subjects,
	OrderStatus,
} from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';
import { OrderCompletedPublisher } from '../publishers/order-completed-publisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId);

		if (!order) {
			throw new Error('Order not found');
		}

		order.set({
			status: OrderStatus.Complete,
		});
		await order.save();

		new OrderCompletedPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			event: {
				id: order.event.id,
			},
		});

		msg.ack();
	}
}

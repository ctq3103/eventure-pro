import {
	Listener,
	OrderExpiredEvent,
	Subjects,
	OrderStatus,
} from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class OrderExpiredListener extends Listener<OrderExpiredEvent> {
	readonly subject = Subjects.OrderExpired;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderExpiredEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId).populate('event');

		if (!order) {
			throw new Error('Order not found');
		}
		if (order.status === OrderStatus.Complete) {
			return msg.ack();
		}

		order.set({
			status: OrderStatus.Cancelled,
		});
		await order.save();

		await new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			event: {
				id: order.event.id,
			},
		});

		msg.ack();
	}
}

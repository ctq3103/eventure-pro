import { Listener, OrderCreatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const order = Order.build({
			id: data.id,
			status: data.status,
			totalPrice: data.totalPrice,
			eventId: data.event.id,
			userId: data.userId,
			version: data.version,
		});
		await order.save();

		msg.ack();
	}
}

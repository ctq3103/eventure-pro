import { Listener, OrderCreatedEvent, Subjects } from '@eventure/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { orderExpiredQueue } from '../../queues/order-expired-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
		console.log(
			`OrderExpired: Waiting ${delay} milliseconds to process the job`
		);

		await orderExpiredQueue.add(
			{
				orderId: data.id,
			},
			{
				delay,
			}
		);

		msg.ack();
	}
}

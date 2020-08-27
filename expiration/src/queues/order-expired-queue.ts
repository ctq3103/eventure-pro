import Queue from 'bull';
import { OrderExpiredPublisher } from '../NATS-events/publishers/order-expired-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
	orderId: string;
}

const orderExpiredQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

orderExpiredQueue.process(async (job) => {
	new OrderExpiredPublisher(natsWrapper.client).publish({
		orderId: job.data.orderId,
	});
});

export { orderExpiredQueue };

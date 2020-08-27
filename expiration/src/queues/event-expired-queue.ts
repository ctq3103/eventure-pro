import Queue from 'bull';
import { EventExpiredPublisher } from '../NATS-events/publishers/event-expired-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
	eventId: string;
}

const eventExpiredQueue = new Queue<Payload>('event:expiration', {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

eventExpiredQueue.process(async (job) => {
	new EventExpiredPublisher(natsWrapper.client).publish({
		eventId: job.data.eventId,
	});
});

export { eventExpiredQueue };

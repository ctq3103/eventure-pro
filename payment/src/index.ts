import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './NATS-events/listeners/order-created-listener';
import { OrderCancelledListener } from './NATS-events/listeners/order-cancelled-listener';

//Mongoose connect
const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed');
			process.exit();
		});
		process.on('SIGINT', () => natsWrapper.client.close()); //interupt signal
		process.on('SIGTERM', () => natsWrapper.client.close()); //terminate signal

		new OrderCreatedListener(natsWrapper.client).listen();
		new OrderCancelledListener(natsWrapper.client).listen();

		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		console.log('Connected to MongoDB!');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000!');
	});
};

start();

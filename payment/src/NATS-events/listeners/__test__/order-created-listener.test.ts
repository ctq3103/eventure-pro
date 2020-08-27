import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus } from '@eventure/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/Order';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);
	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: 'nmnmnmnmn',
		userId: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		totalPrice: 100,
		event: {
			id: mongoose.Types.ObjectId().toHexString(),
			price: 10,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('replicates the order info', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);

	const order = await Order.findById(data.id);
	expect(order!.totalPrice).toEqual(data.totalPrice);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

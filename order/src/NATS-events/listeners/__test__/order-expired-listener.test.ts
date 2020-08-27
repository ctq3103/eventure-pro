import { OrderExpiredListener } from '../order-expired-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Event } from '../../../models/Event';
import mongoose from 'mongoose';
import { Order } from '../../../models/Order';
import { OrderStatus, OrderExpiredEvent, TicketStatus } from '@eventure/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderExpiredListener(natsWrapper.client);

	const event = Event.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'test title',
		price: 50,
		status: TicketStatus.Available,
	});
	await event.save();
	const order = Order.build({
		status: OrderStatus.Created,
		userId: mongoose.Types.ObjectId().toHexString(),
		expiresAt: new Date(),
		eventId: event.id,
		event,
		numberOfTickets: 4,
		totalPrice: 200,
	});
	await order.save();
	const data: OrderExpiredEvent['data'] = {
		orderId: order.id,
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, event, data, msg };
};

it('updates the order status to cancelled', async () => {
	const { listener, order, event, data, msg } = await setup();
	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
	const { listener, order, event, data, msg } = await setup();
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const natsEventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(natsEventData.id).toEqual(order.id);
});

it('acks the message', async () => {
	const { listener, order, event, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

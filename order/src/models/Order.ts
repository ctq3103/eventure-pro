import mongoose from 'mongoose';
import { OrderStatus } from '@eventure/common';
import { EventDoc } from './Event';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An Interface that describes the properties
// that are required to create a new Order
interface OrderAttrs {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	numberOfTickets: number;
	totalPrice: number;
	event: EventDoc;
}

//An Interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

//An Interface that describes the properties
// that a Order Document has
interface OrderDoc extends mongoose.Document {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	numberOfTickets: number;
	totalPrice: number;
	version: number;
	event: EventDoc;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
		},
		numberOfTickets: {
			type: Number,
			default: 1,
			min: 1,
			max: 50,
		},
		totalPrice: {
			type: Number,
		},
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

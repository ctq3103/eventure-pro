import mongoose from 'mongoose';
import { TicketStatus } from '@eventure/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An Interface that describes the properties
// that are required to create a new Event
interface EventAttrs {
	title: string;
	description: string;
	address: string;
	datetime: Date;
	price: number;
	totalTickets: number;
	status: TicketStatus;
	userId: string;
	organizationId: string;
}

//An Interface that describes the properties
// that a Event Model has
interface EventModel extends mongoose.Model<EventDoc> {
	build(attrs: EventAttrs): EventDoc;
}

//An Interface that describes the properties
// that a Event Document has
interface EventDoc extends mongoose.Document {
	id: string;
	title: string;
	description: string;
	address: string;
	datetime: Date;
	price: number;
	totalTickets: number;
	status: TicketStatus;
	userId: string;
	organizationId: string;
	duration: string;
	requirements: string;
	version: number;
	paymentIds: string[];
}

const eventSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		datetime: {
			type: Date,
			required: true,
			default: Date.now() + 7 * 24 * 60 * 60 * 1000,
			min: Date.now,
		},
		price: {
			type: Number,
			required: true,
			default: 50,
			min: 0,
		},
		totalTickets: {
			type: Number,
			required: true,
			default: 50,
		},
		status: {
			type: String,
			enum: Object.values(TicketStatus),
			default: TicketStatus.Available,
		},
		userId: {
			type: String,
			required: true,
		},
		organizationId: {
			type: String,
			required: true,
		},
		paymentIds: {
			type: [String],
			default: [],
		},
		duration: {
			type: String,
		},
		requirements: {
			type: String,
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

eventSchema.set('versionKey', 'version');
eventSchema.plugin(updateIfCurrentPlugin);

eventSchema.pre<EventDoc>('save', function () {
	const event = this;
	if (event.paymentIds.length === event.totalTickets) {
		event.status = TicketStatus.SoldOut;
	}
});

eventSchema.statics.build = (attrs: EventAttrs) => {
	return new Event(attrs);
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

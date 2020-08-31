import mongoose from 'mongoose';
import { TicketStatus } from '@eventure/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import slugify from 'slugify';
import { OrgDoc } from './Organization';

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
export interface EventDoc extends mongoose.Document {
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
	slug: string;
	version: number;
	organization: OrgDoc;
	paymentIds: string[];
	image?: {
		name: string;
		data: Buffer;
	};
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
		organization: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Organization',
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
		image: {
			name: String,
			data: Buffer,
		},
		slug: String,
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

eventSchema.pre<EventDoc>('save', function () {
	this.slug = slugify(this.title, { lower: true });
});

//Get average price of all events of a single organization
eventSchema.statics.getAveragePrice = async function (organizationId: string) {
	await this.aggregate([
		{
			$match: { organization: organizationId },
		},
		{
			$group: {
				id: '$organization',
				averagePrice: { $avg: '$price' },
			},
		},
	]);
};

eventSchema.statics.build = (attrs: EventAttrs) => {
	return new Event(attrs);
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

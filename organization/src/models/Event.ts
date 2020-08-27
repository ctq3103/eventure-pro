import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketStatus } from '@eventure/common';
import { OrgDoc } from './Organization';

//An Interface that describes the properties
// that are required to create a new Event
interface EventAttrs {
	id: string;
	title: string;
	datetime: Date;
	price: number;
	userId: string;
	status: TicketStatus;
	organizationId: string;
}

//An Interface that describes the properties
// that a Event Model has
interface EventModel extends mongoose.Model<EventDoc> {
	build(attrs: EventAttrs): EventDoc;
	findByNatsEvent(event: {
		id: string;
		version: number;
	}): Promise<EventDoc | null>;
	findByStatus(event: {
		id: string;
		status: TicketStatus;
	}): Promise<EventDoc | null>;
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
	status: TicketStatus;
	userId: string;
	duration: string;
	requirements: string;
	organizationId: string;
	organization: OrgDoc;
	version: number;
}

const eventSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		datetime: {
			type: Date,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			default: 50,
			min: 0,
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
		duration: {
			type: String,
		},
		requirements: {
			type: String,
		},
		organizationId: {
			type: String,
		},
		organization: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Organization',
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

eventSchema.statics.findByNatsEvent = (event: {
	id: string;
	version: number;
}) => {
	return Event.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

eventSchema.statics.findByStatus = (event: {
	id: string;
	status: TicketStatus;
}) => {
	return Event.find({
		_id: event.id,
		status: event.status,
	});
};

eventSchema.statics.build = ({
	id,
	title,
	price,
	datetime,
	status,
	userId,
	organizationId,
}: EventAttrs) => {
	return new Event({
		_id: id,
		title,
		price,
		datetime,
		status,
		userId,
		organizationId,
	});
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

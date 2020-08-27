import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketStatus } from '@eventure/common';

//An Interface that describes the properties
// that are required to create a new Event
interface EventAttrs {
	id: string;
	datetime: string;
	status: TicketStatus;
}

//An Interface that describes the properties
// that a Event Model has
interface EventModel extends mongoose.Model<EventDoc> {
	build(attrs: EventAttrs): EventDoc;
}

//An Interface that describes the properties
// that a Event Document has
export interface EventDoc extends mongoose.Document {
	datetime: string;
	status: TicketStatus;
	version: number;
}

const eventSchema = new mongoose.Schema(
	{
		datetime: String,
		status: {
			type: String,
			enum: Object.values(TicketStatus),
			default: TicketStatus.Available,
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

eventSchema.statics.build = (attrs: EventAttrs) => {
	return new Event({
		_id: attrs.id,
		datetime: attrs.datetime,
		status: attrs.status,
	});
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

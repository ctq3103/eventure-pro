import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An Interface that describes the properties
// that are required to create a new Event
interface EventAttrs {
	id: string;
	title: string;
	price: number;
}

//An Interface that describes the properties
// that a Event Model has
interface EventModel extends mongoose.Model<EventDoc> {
	build(attrs: EventAttrs): EventDoc;
	findByNatsEvent(event: {
		id: string;
		version: number;
	}): Promise<EventDoc | null>;
}

//An Interface that describes the properties
// that a Event Document has
export interface EventDoc extends mongoose.Document {
	title: string;
	price: number;
	version: number;
}

const eventSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			default: 50,
			min: 0,
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
eventSchema.statics.build = (attrs: EventAttrs) => {
	return new Event({
		_id: attrs.id,
		title: attrs.title,
		price: attrs.price,
	});
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

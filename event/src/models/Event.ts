import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An Interface that describes the properties
// that are required to create a new Event
interface EventAttrs {
	title: string;
	description: string;
	address: string;
	datetime: Date;
	price: number;
	userId: string;
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
	userId: string;
	duration: string;
	requirements: string;
	version: number;
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
	return new Event(attrs);
};

const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema);

export { Event };

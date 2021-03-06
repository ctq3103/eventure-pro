import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import slugify from 'slugify';

//An Interface that describes the properties
// that are required to create a new Organization
interface OrgAttrs {
	name: string;
	description: string;
	address: string;
	userId: string;
	image?: {
		name: string;
		data: Buffer;
	};
	version: number;
}

//An Interface that describes the properties
// that Org Document has
interface OrgDoc extends mongoose.Document {
	name: string;
	description: string;
	address: string;
	email: string;
	slug: string;
	userId: string;
	image?: {
		name: string;
		data: Buffer;
	};
	version: number;
}

//An Interface that describes the properties
// that a Org Model has
interface OrgModel extends mongoose.Model<OrgDoc> {
	build(attrs: OrgAttrs): OrgDoc;
}

const orgSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			unique: true,
			trim: true,
			maxlength: [50, 'Name cannot be more than 50 characters'],
		},
		description: {
			type: String,
			required: [true, 'Please add description'],
			maxlength: [500, 'Name cannot be more than 500 characters'],
		},
		address: {
			type: String,
			required: [true, 'Please add an address'],
		},
		website: {
			type: String,
			match: [
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				'Please use a valid URL with HTTP or HTTPS',
			],
		},
		email: {
			type: String,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please add a valid email',
			],
		},
		image: {
			name: String,
			data: Buffer,
		},
		slug: String,
		userId: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
		toObject: { virtuals: true },
	}
);

orgSchema.set('versionKey', 'version');
orgSchema.plugin(updateIfCurrentPlugin);

orgSchema.virtual('events', {
	ref: 'Event',
	localField: 'id',
	foreignField: 'organization',
	justOne: false,
});

orgSchema.pre<OrgDoc>('save', function () {
	this.slug = slugify(this.name, { lower: true });
});

orgSchema.statics.build = (attrs: OrgAttrs) => {
	return new Organization(attrs);
};

const Organization = mongoose.model<OrgDoc, OrgModel>(
	'Organization',
	orgSchema
);

export { Organization };

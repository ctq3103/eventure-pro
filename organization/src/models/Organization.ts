import mongoose from 'mongoose';

//An Interface that describes the properties
// that are required to create a new Organization
interface OrgAttrs {
	name: string;
	description: string;
	address: string;
	userId: string;
}

//An Interface that describes the properties
// that Org Document has
interface OrgDoc extends mongoose.Document {
	name: string;
	description: string;
	address: string;
	userId: string;
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
	}
);

orgSchema.statics.build = (attrs: OrgAttrs) => {
	return new Organization(attrs);
};

const Organization = mongoose.model<OrgDoc, OrgModel>(
	'Organization',
	orgSchema
);

export { Organization };

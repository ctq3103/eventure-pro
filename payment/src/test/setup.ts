import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

declare global {
	namespace NodeJS {
		interface Global {
			getAuthCookie(id?: string): string[];
		}
	}
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
	process.env.JWT_KEY = 'pikachu';

	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.getAuthCookie = (id?: string) => {
	// Build a JWT payload
	const payload = {
		id: id || mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com',
	};

	//Create the JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// Build session Object
	const session = { jwt: token };

	// Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	//Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// return a string thats the cookie with the encoded data
	return [`express:sess=${base64}`];
};

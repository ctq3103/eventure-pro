import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import request from 'supertest';

declare global {
	namespace NodeJS {
		interface Global {
			getAuthCookie(): string[];
		}
	}
}

//Use mock for fake version of natsWrapper for testing
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
	//reset mock function before each test
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

global.getAuthCookie = () => {
	// Build a JWT payload { id, email}
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com',
	};

	// Create the JWT!
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// Build session object { "jwt": MY-JWT}
	const session = { jwt: token };

	// Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	//Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// return a string thats the cookie with the encoded data
	return [`express:sess=${base64}`];
};

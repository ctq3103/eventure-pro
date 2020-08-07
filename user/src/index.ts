import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();

//traffic is been proxy to the app through ingress nginx,
//by default express does not trust https connection
app.set('trust proxy', true);
//Body parser
app.use(express.json());

app.use(
	cookieSession({
		//disable encryption
		signed: false,
		secure: true,
	})
);

const path = '/api/v1/users';

//Routes
app.use(path, currentUserRouter);
app.use(path, signupRouter);
app.use(path, signinRouter);
app.use(path, signoutRouter);

app.get('*', async () => {
	throw new NotFoundError();
});

//Middlewares
app.use(errorHandler);

//Mongoose connect
const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	try {
		await mongoose.connect('mongodb://user-mongo-srv:27017/user', {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		console.log('Connected to MongoDB!');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000!');
	});
};

start();

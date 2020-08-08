import mongoose from 'mongoose';
import { app } from './app';

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

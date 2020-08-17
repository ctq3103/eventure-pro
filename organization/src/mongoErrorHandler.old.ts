import { Response, Request, NextFunction } from 'express';
import { CustomError } from '@eventure/common';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';

export const mongoErrorHandler = (
	err: Error | MongooseError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error(err);

	//Mongoose bad ObjectId
	if (err instanceof MongooseError.CastError) {
		const message = `Resource not found with ID of ${err.value}`;

		res.status(404).send({
			errors: [{ message }],
		});
	}

	//Mongoose duplicate key
	if (err instanceof MongoError && err.code === 11000) {
		const message = 'Duplicate field value entered';

		res.status(400).send({
			errors: [{ message }],
		});
	}

	//Mongoose validation error
	if (err instanceof MongooseError.ValidationError) {
		const message = Object.values(err.errors).map((val) => val.message);
		res.status(400).send({
			errors: [{ message }],
		});
	}

	if (err instanceof CustomError) {
		return res.status(err.statusCode).send({ errors: err.serializeErrors() });
	}

	res.status(400).send({
		errors: [{ message: 'Something went wrong!' }],
	});
};

import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@eventure/common';
import { Event } from '../models/Event';
import { EventCreatedPublisher } from '../NATS-events/publishers/event-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/events',
	requireAuth,
	[
		body('title').trim().not().isEmpty().withMessage('Title is required'),
		body('description')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Description is required'),
		body('address').trim().not().isEmpty().withMessage('Address is required'),
		body('datetime').not().isEmpty().withMessage('Date and Time is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be greater than 0'),
		body('totalTickets')
			.isInt({ gt: 0 })
			.withMessage('Total tickets must be greater than 0'),
		body('organizationId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('Organization ID must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const event = Event.build({
			...req.body,
			userId: req.currentUser!.id,
		});
		await event.save();

		const {
			id,
			title,
			address,
			price,
			totalTickets,
			status,
			datetime,
			userId,
			version,
			organizationId,
		} = event;
		new EventCreatedPublisher(natsWrapper.client).publish({
			id,
			title,
			address,
			price,
			status,
			datetime: datetime.toISOString(),
			userId,
			organizationId,
			version,
		});
		res.status(201).send(event);
	}
);

export { router as createEventRouter };

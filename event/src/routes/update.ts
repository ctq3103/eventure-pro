import express, { Request, Response, Express } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	BadRequestError,
} from '@eventure/common';
import { body } from 'express-validator';
import { Event } from '../models/Event';
import { natsWrapper } from '../nats-wrapper';
import { EventUpdatedPublisher } from '../NATS-events/publishers/event-updated-publisher';
import path from 'path';

const router = express.Router();

router.put(
	'/api/events/:id',
	requireAuth,
	[
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and must be greater than 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const event = await Event.findById(req.params.id);

		if (!event) {
			throw new NotFoundError();
		}

		if (event.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		event.set({
			...req.body,
		});

		await event.save();

		const {
			id,
			title,
			address,
			price,
			status,
			datetime,
			userId,
			version,
			organizationId,
		} = event;
		await new EventUpdatedPublisher(natsWrapper.client).publish({
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

		res.send(event);
	}
);

export { router as updateEventRouter };

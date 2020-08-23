import express, { Request, Response } from 'express';
import { Event } from '../models/Event';
import { NotFoundError } from '@eventure/common';

const router = express.Router();

router.get('/api/events/:id', async (req: Request, res: Response) => {
	const event = await Event.findById(req.params.id);

	if (!event) {
		throw new NotFoundError();
	}

	res.send(event);
});

export { router as showEventRouter };

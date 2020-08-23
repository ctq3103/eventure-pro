import express, { Request, Response } from 'express';
import { Event } from '../models/Event';

const router = express.Router();

router.get('/api/events', async (req: Request, res: Response) => {
	const event = await Event.find({});

	res.status(200).send(event);
});

export { router as indexEventRouter };

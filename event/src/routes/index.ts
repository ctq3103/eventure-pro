import express, { Request, Response } from 'express';
import { Event } from '../models/Event';
import { advancedResults } from '@eventure/common';

const router = express.Router();

router.get(
	'/api/events',
	advancedResults(Event),
	async (req: Request, res: Response) => {
		res.status(200).send(res.advancedResults);
	}
);

export { router as indexEventRouter };

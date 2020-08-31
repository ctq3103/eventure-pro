import express, { Request, Response } from 'express';
import { Event } from '../models/Event';
import { NotFoundError, advancedResults } from '@eventure/common';
import { Organization } from '../models/Organization';

const router = express.Router();

router.get(
	'/api/organizations/:orgId/events',
	async (req: Request, res: Response) => {
		const org = await Organization.findById(req.params.orgId);

		if (!org) {
			throw new NotFoundError();
		}

		const events = await Event.find({
			organizationId: req.params.orgId,
		});

		res.send(events);
	}
);

export { router as showEventsRouter };

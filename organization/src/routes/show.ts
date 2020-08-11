import express, { Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { NotFoundError } from '@eventure/common';

const router = express.Router();

router.get('/api/organizations/:id', async (req: Request, res: Response) => {
	const org = await Organization.findById(req.params.id);

	if (!org) {
		throw new NotFoundError();
	}

	res.send(org);
});

export { router as showOrgRouter };

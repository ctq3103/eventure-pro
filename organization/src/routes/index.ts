import express, { Request, Response } from 'express';
import { Organization } from '../models/Organization';

const router = express.Router();

router.get('/api/organizations', async (req: Request, res: Response) => {
	const orgs = await Organization.find({});

	res.status(200).send(orgs);
});

export { router as indexOrgRouter };

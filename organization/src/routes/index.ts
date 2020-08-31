import express, { Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { advancedResults } from '@eventure/common';

const router = express.Router();

router.get(
	'/api/organizations',
	advancedResults(Organization),
	async (req: Request, res: Response) => {
		res.status(200).send(res.advancedResults);
	}
);

export { router as indexOrgRouter };

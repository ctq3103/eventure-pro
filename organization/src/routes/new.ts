import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@eventure/common';
import { body } from 'express-validator';
import { Organization } from '../models/Organization';

const router = express.Router();

router.post(
	'/api/organizations',
	requireAuth,
	[
		body('name').trim().not().isEmpty().withMessage('Name is required'),
		body('description')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Description is required'),
		body('address').trim().not().isEmpty().withMessage('Address is required'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const newOrg = Organization.build({
			...req.body,
			userId: req.currentUser!.id,
		});
		await newOrg.save();
		res.status(201).send(newOrg);
	}
);

export { router as createOrgRouter };

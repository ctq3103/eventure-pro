import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@eventure/common';
import { body } from 'express-validator';
import { Organization } from '../models/Organization';
import { OrganizationCreatedPublisher } from '../NATS-events/publishers/organization-created-publisher';
import { natsWrapper } from '../nats-wrapper';

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

		const { id, name, description, address, userId, version } = newOrg;
		await new OrganizationCreatedPublisher(natsWrapper.client).publish({
			id,
			name,
			description,
			address,
			userId,
			version,
		});
		res.status(201).send(newOrg);
	}
);

export { router as createOrgRouter };

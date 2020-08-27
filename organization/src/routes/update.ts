import express, { Request, Response, request } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
} from '@eventure/common';
import { body } from 'express-validator';
import { Organization } from '../models/Organization';
import { OrganizationUpdatedPublisher } from '../NATS-events/publishers/organization-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
	'/api/organizations/:id',
	requireAuth,
	[body('name').trim().not().isEmpty().withMessage('Name is required')],
	validateRequest,
	async (req: Request, res: Response) => {
		const org = await Organization.findById(req.params.id);

		if (!org) {
			throw new NotFoundError();
		}

		if (org.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		org.set({
			...req.body,
		});

		await org.save();

		new OrganizationUpdatedPublisher(natsWrapper.client).publish({
			...req.body,
			version: org.version,
		});
		res.send(org);
	}
);

export { router as updateOrgRouter };

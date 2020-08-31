import express, { Request, Response, Express } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	BadRequestError,
} from '@eventure/common';
import path from 'path';
import { Organization } from '../models/Organization';

const MAX_FILE_UPLOAD = 1000000;

const router = express.Router();

router.put(
	'/api/organizations/:id/photo',
	requireAuth,
	validateRequest,
	async (req: Request, res: Response) => {
		const organization = await Organization.findById(req.params.id);

		if (!organization) {
			throw new NotFoundError();
		}

		if (organization.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		if (!req.files) {
			throw new BadRequestError('Please upload an image');
		}

		let image = req.files.image;

		if (image instanceof Array) {
			throw new BadRequestError('Please upload only one image');
		}

		//Make sure the image is photo
		if (!image.mimetype.startsWith('image')) {
			throw new BadRequestError('File is not image type');
		}

		//Check file size
		if (image.size > MAX_FILE_UPLOAD) {
			throw new BadRequestError(
				`Please upload an image less than ${MAX_FILE_UPLOAD}`
			);
		}

		// Create custom imagename
		image.name = `photo_${organization.id}${path.parse(image.name).ext}`;

		const imgpath = `${__dirname}/../logo`;

		//Upload image
		image.mv(`${imgpath}/${image.name}`, async (err) => {
			if (err) {
				throw new BadRequestError('Something went wrong with this upload');
			}
		});

		organization.set({
			image: {
				name: image.name,
				data: image.data,
			},
		});

		await organization.save();

		res.send(organization);
	}
);

export { router as updatePhotoOrgRouter };

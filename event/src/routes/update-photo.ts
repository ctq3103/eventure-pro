import express, { Request, Response, Express } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	BadRequestError,
} from '@eventure/common';
import { Event } from '../models/Event';
import path from 'path';

const MAX_FILE_UPLOAD = 1000000;

const router = express.Router();

router.put(
	'/api/events/:id/photo',
	requireAuth,
	validateRequest,
	async (req: Request, res: Response) => {
		const event = await Event.findById(req.params.id);

		if (!event) {
			throw new NotFoundError();
		}

		if (event.userId !== req.currentUser!.id) {
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
		image.name = `photo_${event.id}${path.parse(image.name).ext}`;

		const imgpath = `${__dirname}/../image`;

		//Upload image
		image.mv(`${imgpath}/${image.name}`, async (err) => {
			if (err) {
				throw new BadRequestError('Something went wrong with this upload');
			}
		});

		event.set({
			image: {
				name: image.name,
				data: image.data,
			},
		});

		await event.save();

		res.send(event);
	}
);

export { router as updatePhotoEventRouter };

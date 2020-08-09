import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@eventure/common';
import { User } from '../models/User';

const router = express.Router();

// @desc    Sign Up user
// @route   POST /api/v1/users/signup
// @access  Public

router.post(
	'/signup',
	[
		body('email').isEmail().withMessage('Please provide a valid email'),
		body('password')
			.trim()
			.isLength({ min: 8, max: 20 })
			.withMessage('Password must be between 8 and 20 characters'),
		body('passwordConfirmation').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new BadRequestError(
					'Password confirmation does not match password'
				);
			}

			return true;
		}),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password, passwordConfirmation } = req.body;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new BadRequestError('Email in use');
		}

		const user = User.build({ email, password, passwordConfirmation });
		await user.save();

		//Generate JWT
		const userJwt = jwt.sign(
			{
				id: user.id,
				email: user.email,
			},
			process.env.JWT_KEY! // exclaimation mark that JWT_KEY cannot be null or undefined
		);

		//Store JWT on session object
		req.session = {
			jwt: userJwt,
		};

		res.status(201).send(user);
	}
);

export { router as signupRouter };

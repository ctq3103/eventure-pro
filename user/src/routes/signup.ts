import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

// @desc    Sign Up user
// @route   POST /api/v1/auth/signup
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
				throw new Error('Password confirmation does not match password');
			}

			return true;
		}),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			throw new RequestValidationError(errors.array());
		}

		const { email, password, passwordConfirmation } = req.body;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new BadRequestError('Email in use');
		}

		const user = User.build({ email, password, passwordConfirmation });
		await user.save();

		res.status(201).send(user);
	}
);

export { router as signupRouter };

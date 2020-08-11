import express, { Request, Response } from 'express';
import { currentUser } from '@eventure/common';

const router = express.Router();

// @desc    Get current user
// @route   GET /api/v1/users/currentuser
// @access  Private

router.get(
	'/api/users/currentuser',
	currentUser,
	(req: Request, res: Response) => {
		res.send({ currentUser: req.currentUser || null });
	}
);

export { router as currentUserRouter };

import express from 'express';

const router = express.Router();

// @desc    Get current user
// @route   GET /api/v1/users/currentuser
// @access  Public

router.get('/currentuser', (req, res) => {
	res.send('Hi there');
});

export { router as currentUserRouter };

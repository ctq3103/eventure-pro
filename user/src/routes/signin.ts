import express from 'express';

const router = express.Router();

// @desc    Sign In user
// @route   POST /api/v1/auth/register
// @access  Private
router.post('/signin', (req, res) => {
	res.send('Hi there');
});

export { router as signinRouter };

import express from 'express';

const router = express.Router();

// @desc    Sign Out user
// @route   POST /api/v1/auth/signout
// @access  Privat

router.post('/signout', (req, res) => {
	res.send('Hi there');
});

export { router as signoutRouter };

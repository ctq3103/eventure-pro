import express from 'express';

const router = express.Router();

// @desc    Sign Out user
// @route   POST /api/v1/users/signout
// @access  Private

router.post('/api/users/signout', (req, res) => {
	req.session = null;

	res.send({});
});

export { router as signoutRouter };

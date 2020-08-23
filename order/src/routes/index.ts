import express, { Request, Response } from 'express';
import { requireAuth } from '@eventure/common';
import { Order } from '../models/Order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
	const orders = await Order.find({
		userId: req.currentUser!.id,
	}).populate('event');

	res.send(orders);
});

export { router as indexOrderRouter };

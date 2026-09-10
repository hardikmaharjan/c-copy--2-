import { Router } from 'express';
import { CommunityPost } from '../models/CommunityPost.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();

router.get('/', asyncRoute(async (_req, res) => {
  res.json({ items: await CommunityPost.find()
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(100) });
}));

router.post('/', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const { title, body, consultancyName, stage } = req.body;
  if (typeof title !== 'string' || title.trim().length < 3 || typeof body !== 'string' || body.trim().length < 10) {
    return res.status(400).json({ message: 'Add a title and at least 10 characters about your experience.' });
  }
  const item = await CommunityPost.create({
    author: req.user!.id,
    title: title.trim(),
    body: body.trim(),
    consultancyName: typeof consultancyName === 'string' ? consultancyName.trim() : '',
    stage,
  });
  await item.populate('author', 'name');
  res.status(201).json(item);
}));

export default router;

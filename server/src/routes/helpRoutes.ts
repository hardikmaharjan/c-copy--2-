import { Router } from 'express';
import { HelpRequest } from '../models/HelpRequest.js';
import { requireAdmin, requireAuth, type AuthRequest } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();
const categories = ['account', 'consultancy', 'visa', 'safety', 'technical', 'other'];
const statuses = ['open', 'in_progress', 'resolved'];

router.post('/', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const { category, subject, message } = req.body;
  if (!categories.includes(category)) return res.status(400).json({ message: 'Choose a valid help category' });
  if (typeof subject !== 'string' || subject.trim().length < 4) return res.status(400).json({ message: 'Add a short subject for your request' });
  if (typeof message !== 'string' || message.trim().length < 10) return res.status(400).json({ message: 'Tell us a little more so we can help' });
  const item = await HelpRequest.create({ user: req.user!.id, category, subject: subject.trim(), message: message.trim() });
  res.status(201).json({ item, message: 'Your help request has been sent.' });
}));

router.get('/mine', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  res.json({ items: await HelpRequest.find({ user: req.user!.id }).sort({ createdAt: -1 }) });
}));

router.get('/', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  res.json({ items: await HelpRequest.find().populate('user', 'name email').sort({ status: 1, createdAt: -1 }) });
}));

router.patch('/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { status, adminReply } = req.body;
  if (!statuses.includes(status)) return res.status(400).json({ message: 'Choose a valid support status' });
  if (adminReply !== undefined && (typeof adminReply !== 'string' || adminReply.trim().length < 2)) return res.status(400).json({ message: 'Write a reply before sending it' });
  const update: Record<string, unknown> = { status };
  if (adminReply !== undefined) { update.adminReply = adminReply.trim(); update.repliedAt = new Date(); }
  const item = await HelpRequest.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  item ? res.json(item) : res.status(404).json({ message: 'Help request not found' });
}));

export default router;

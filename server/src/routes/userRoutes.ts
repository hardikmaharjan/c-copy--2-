import { Router } from 'express';
import { User } from '../models/User.js';
import { Consultancy } from '../models/Consultancy.js';
import { Content } from '../models/Content.js';
import { requireAdmin, requireAuth, type AuthRequest } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();
const publicUser = (user: any) => ({ id: user._id, name: user.name, email: user.email, role: user.role, verifiedAt: user.verifiedAt, createdAt: user.createdAt });

router.get('/me', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(user));
}));
router.patch('/me', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  const user = await User.findByIdAndUpdate(req.user!.id, { name: name.trim() }, { new: true });
  res.json(publicUser(user));
}));
router.get('/me/saved', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).populate('savedConsultancies').populate('savedContent');
  res.json({ consultancies: user?.savedConsultancies || [], content: user?.savedContent || [] });
}));
router.post('/me/saved/consultancies/:id', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  if (!await Consultancy.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Consultancy not found' });
  await User.findByIdAndUpdate(req.user!.id, { $addToSet: { savedConsultancies: req.params.id } });
  res.status(201).json({ message: 'Consultancy saved' });
}));
router.delete('/me/saved/consultancies/:id', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  await User.findByIdAndUpdate(req.user!.id, { $pull: { savedConsultancies: req.params.id } });
  res.json({ message: 'Consultancy removed from saved items' });
}));
router.post('/me/saved/content/:id', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  if (!await Content.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Content not found' });
  await User.findByIdAndUpdate(req.user!.id, { $addToSet: { savedContent: req.params.id } });
  res.status(201).json({ message: 'Information saved' });
}));
router.get('/', requireAuth, requireAdmin, asyncRoute(async (_req, res) => res.json({ items: (await User.find().sort({ createdAt: -1 })).map(publicUser) })));
router.patch('/:id/role', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!['student', 'admin'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  user ? res.json(publicUser(user)) : res.status(404).json({ message: 'User not found' });
}));
export default router;

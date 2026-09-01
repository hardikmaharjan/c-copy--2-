import { Router } from 'express';
import { Consultancy } from '../models/Consultancy.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();

router.get('/', asyncRoute(async (req, res) => {
  const search = String(req.query.search || '').trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const country = String(req.query.country || '').trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { city: { $regex: search, $options: 'i' } }];
  if (country) {
    filter.destinations = { $regex: `^${country}$`, $options: 'i' };
    filter.verificationStatus = 'verified';
  }
  res.json({ items: await Consultancy.find(filter).sort({ rating: -1, reviewCount: -1, name: 1 }) });
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const item = await Consultancy.findById(req.params.id);
  item ? res.json(item) : res.status(404).json({ message: 'Consultancy not found' });
}));
router.post('/', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  res.status(201).json(await Consultancy.create(req.body));
}));
router.patch('/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const item = await Consultancy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  item ? res.json(item) : res.status(404).json({ message: 'Consultancy not found' });
}));
router.patch('/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!['pending', 'verified', 'rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid verification status' });
  const item = await Consultancy.findByIdAndUpdate(req.params.id, { verificationStatus: req.body.status }, { new: true, runValidators: true });
  item ? res.json(item) : res.status(404).json({ message: 'Consultancy not found' });
}));
router.delete('/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const item = await Consultancy.findByIdAndDelete(req.params.id);
  item ? res.status(204).end() : res.status(404).json({ message: 'Consultancy not found' });
}));

export default router;

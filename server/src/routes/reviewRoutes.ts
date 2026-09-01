import { Router } from 'express';
import { Review } from '../models/Review.js';
import { Consultancy } from '../models/Consultancy.js';
import { requireAdmin, requireAuth, type AuthRequest } from '../middleware/auth.js';
import { refreshConsultancyRating } from '../services/ConsultancyRatingService.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();
const listForAdmin = async (_req: any, res: any) => res.json({ items: await Review.find().populate('author', 'name email').populate('consultancy', 'name city').sort({ createdAt: -1 }) });
// Keep the admin route before the public route and expose an unambiguous alias.
router.get('/admin/all', requireAuth, requireAdmin, asyncRoute(listForAdmin));
router.get('/admin/reviews', requireAuth, requireAdmin, asyncRoute(listForAdmin));
router.get('/', asyncRoute(async (req, res) => {
  if (!req.query.consultancy) return res.status(400).json({ message: 'Consultancy is required' });
  res.json({ items: await Review.find({ consultancy: req.query.consultancy, status: 'published' }).populate('author', 'name').sort({ createdAt: -1 }) });
}));
router.post('/', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const { consultancy, rating, body } = req.body;
  const numericRating = Number(rating);
  if (!consultancy || !await Consultancy.exists({ _id: consultancy })) return res.status(404).json({ message: 'Consultancy not found' });
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: 'Choose a rating from 1 to 5.' });
  if (typeof body !== 'string' || body.trim().length < 15) return res.status(400).json({ message: 'Please write at least 15 characters about your experience.' });
  if (await Review.exists({ author: req.user!.id, consultancy })) return res.status(409).json({ message: 'You have already reviewed this consultancy.' });
  const review = await Review.create({ consultancy, rating: numericRating, body: body.trim(), author: req.user!.id, status: 'pending' });
  res.status(201).json({ review, message: 'Review submitted for moderation.' });
}));
router.post('/:id/report', requireAuth, asyncRoute(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: 'flagged' }, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await refreshConsultancyRating(review.consultancy);
  res.json({ message: 'Review flagged for moderation' });
}));
router.patch('/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!['pending', 'published', 'flagged', 'hidden'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid review status' });
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await refreshConsultancyRating(review.consultancy);
  res.json(review);
}));
export default router;

import { Router } from 'express';
import { Report } from '../models/Report.js';
import { requireAdmin, requireAuth, type AuthRequest } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();

router.post('/', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  const { consultancy, consultancyName, scamType, description, evidenceUrl, evidencePhoto } = req.body;
  if (typeof scamType !== 'string' || typeof description !== 'string' || description.trim().length < 10)
    return res.status(400).json({ message: 'Scam type and a description of at least 10 characters are required' });
  if (evidencePhoto && (typeof evidencePhoto !== 'string' || !evidencePhoto.startsWith('data:image/') || evidencePhoto.length > 550000))
    return res.status(400).json({ message: 'The evidence photo is invalid or too large' });
  const evidence = evidenceUrl ? [{ url: String(evidenceUrl), label: 'Evidence link' }] : [];
  if (evidencePhoto) evidence.push({ url: evidencePhoto, label: 'Attached evidence photo' });
  res.status(201).json(await Report.create({ consultancy, consultancyName: String(consultancyName || '').trim(), scamType: scamType.trim(), description: description.trim(), reporter: req.user!.id, evidence }));
}));
router.get('/mine', requireAuth, asyncRoute(async (req: AuthRequest, res) => {
  res.json({ items: await Report.find({ reporter: req.user!.id }).sort({ createdAt: -1 }) });
}));
router.get('/', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  res.json({ items: await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 }) });
}));
router.patch('/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  if (!['submitted', 'under_review', 'verified', 'resolved', 'rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid report status' });
  const item = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNotes: req.body.adminNotes }, { new: true, runValidators: true });
  item ? res.json(item) : res.status(404).json({ message: 'Report not found' });
}));

export default router;

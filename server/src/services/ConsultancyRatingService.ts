import { Types } from 'mongoose';
import { Consultancy } from '../models/Consultancy.js';
import { Review } from '../models/Review.js';

/** Keeps the directory score in sync with reviews visible to students. */
export async function refreshConsultancyRating(consultancyId: string | Types.ObjectId) {
  const [summary] = await Review.aggregate([
    { $match: { consultancy: new Types.ObjectId(consultancyId), status: 'published' } },
    { $group: { _id: '$consultancy', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  await Consultancy.findByIdAndUpdate(consultancyId, {
    rating: summary ? Math.round(summary.average * 10) / 10 : 0,
    reviewCount: summary?.count || 0
  });
}

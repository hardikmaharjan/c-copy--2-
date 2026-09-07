import { Schema, model } from 'mongoose';
const reviewSchema = new Schema({ author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, consultancy: { type: Schema.Types.ObjectId, ref: 'Consultancy', required: true }, rating: { type: Number, min: 1, max: 5, required: true }, body: { type: String, required: true, trim: true, minlength: 15, maxlength: 1500 }, status: { type: String, enum: ['pending', 'published', 'flagged', 'hidden'], default: 'published' } }, { timestamps: true });
reviewSchema.index({ author: 1, consultancy: 1 }, { unique: true });
export const Review = model('Review', reviewSchema);

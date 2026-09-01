import { Schema, model } from 'mongoose';

const helpRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['account', 'consultancy', 'visa', 'safety', 'technical', 'other'], required: true },
  subject: { type: String, required: true, trim: true, minlength: 4, maxlength: 120 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  adminReply: { type: String, trim: true, maxlength: 2000 },
  repliedAt: Date
}, { timestamps: true });

export const HelpRequest = model('HelpRequest', helpRequestSchema);

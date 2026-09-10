import { Schema, model } from 'mongoose';

const communityPostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, maxlength: 3000 },
  consultancyName: { type: String, trim: true, maxlength: 120 },
  stage: { type: String, enum: ['Researching', 'Applying', 'Visa process', 'Accepted', 'Studying abroad', 'Other'], default: 'Other' },
}, { timestamps: true });

export const CommunityPost = model('CommunityPost', communityPostSchema);

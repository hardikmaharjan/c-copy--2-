import { Schema, model } from 'mongoose';
const contentSchema = new Schema({ type: { type: String, enum: ['visa', 'country', 'university', 'scam_alert'], required: true }, title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, summary: String, sections: [{ heading: String, body: String }], published: { type: Boolean, default: false }, author: { type: Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
export const Content = model('Content', contentSchema);

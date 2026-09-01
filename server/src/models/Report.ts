import { Schema, model } from 'mongoose';
const reportSchema = new Schema({ reporter: { type: Schema.Types.ObjectId, ref: 'User' }, consultancy: { type: Schema.Types.ObjectId, ref: 'Consultancy' }, consultancyName: String, scamType: { type: String, required: true }, description: { type: String, required: true }, evidence: [{ url: String, label: String }], status: { type: String, enum: ['submitted', 'under_review', 'verified', 'resolved', 'rejected'], default: 'submitted' }, adminNotes: String }, { timestamps: true });
export const Report = model('Report', reportSchema);

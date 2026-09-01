import { Schema, model } from 'mongoose';
const userSchema = new Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ['student', 'admin'], default: 'student' }, verifiedAt: Date, otpHash: String, otpExpiresAt: Date, savedConsultancies: [{ type: Schema.Types.ObjectId, ref: 'Consultancy' }], savedContent: [{ type: Schema.Types.ObjectId, ref: 'Content' }] }, { timestamps: true });
export const User = model('User', userSchema);

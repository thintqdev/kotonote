import mongoose from 'mongoose';
import { EMAIL_DIGEST_KIND } from '../constants/emailDigest.js';

const emailDigestLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		kind: {
			type: String,
			enum: Object.values(EMAIL_DIGEST_KIND),
			required: true,
		},
		/** daily: YYYY-MM-DD local; weekly: YYYY-MM-DD (thứ Hai tuần đó) */
		periodKey: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true },
);

emailDigestLogSchema.index({ userId: 1, kind: 1, periodKey: 1 }, { unique: true });

export default mongoose.model('EmailDigestLog', emailDigestLogSchema);

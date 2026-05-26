import mongoose from 'mongoose';

const membershipCheckoutSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		tierId: {
			type: String,
			required: true,
			trim: true,
		},
		billing: {
			type: String,
			enum: ['yearly', 'lifetime'],
			required: true,
		},
		amountVnd: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			default: 'VND',
			trim: true,
		},
		status: {
			type: String,
			enum: ['pending', 'paid', 'cancelled', 'expired', 'refunded'],
			default: 'pending',
			index: true,
		},
		provider: {
			type: String,
			enum: ['mock', 'payos'],
			default: 'mock',
			index: true,
		},
		/** Mã orderCode gửi PayOS (số, unique) */
		providerOrderCode: {
			type: Number,
			sparse: true,
			unique: true,
		},
		providerPaymentLinkId: { type: String, trim: true },
		providerTransactionId: { type: String, trim: true },
		paymentUrl: { type: String, trim: true },
		paidAt: { type: Date },
		refundedAt: { type: Date },
		refundReason: { type: String, trim: true, maxlength: 500 },
		refundedByAdminId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		webhookProcessedAt: { type: Date },
		sessionExpiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
);

membershipCheckoutSchema.index({ userId: 1, status: 1, createdAt: -1 });
membershipCheckoutSchema.index({ provider: 1, providerOrderCode: 1 });

export default mongoose.model('MembershipCheckout', membershipCheckoutSchema);

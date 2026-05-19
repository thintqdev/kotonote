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
			enum: ['pending', 'paid', 'cancelled', 'expired'],
			default: 'pending',
			index: true,
		},
		paidAt: { type: Date },
		sessionExpiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
);

membershipCheckoutSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('MembershipCheckout', membershipCheckoutSchema);

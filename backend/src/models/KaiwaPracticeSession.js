import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema(
	{
		summaryVi: { type: String, default: '' },
		grammarNoteVi: { type: String, default: '' },
		politenessVi: { type: String, default: '' },
		naturalnessVi: { type: String, default: '' },
		suggestion: {
			replyJa: { type: String, default: '' },
			replyReading: { type: String, default: '' },
			replyVi: { type: String, default: '' },
		},
	},
	{ _id: false },
);

const sessionMessageSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ['user', 'partner'],
			required: true,
		},
		textJa: { type: String, required: true, trim: true },
		textVi: { type: String, default: '', trim: true },
		coach: { type: coachSchema, default: undefined },
	},
	{ _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const kaiwaPracticeSessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		contextId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'KaiwaContext',
			required: true,
			index: true,
		},
		contextTitleVi: { type: String, default: '', trim: true },
		contextTitleJa: { type: String, default: '', trim: true },
		jlpt: { type: String, default: 'N5' },
		category: { type: String, default: 'daily' },
		userRoleIndex: { type: Number, default: 0 },
		partnerRoleIndex: { type: Number, default: 1 },
		messages: {
			type: [sessionMessageSchema],
			default: [],
		},
		turnCount: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
		lastActivityAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

kaiwaPracticeSessionSchema.index({ userId: 1, lastActivityAt: -1 });
kaiwaPracticeSessionSchema.index({ userId: 1, contextId: 1, lastActivityAt: -1 });

export default mongoose.model('KaiwaPracticeSession', kaiwaPracticeSessionSchema);

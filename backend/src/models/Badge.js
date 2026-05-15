import mongoose from 'mongoose';

const BADGE_CATEGORIES = [
	'streak',
	'vocabulary',
	'kanji',
	'grammar',
	'reading',
	'listening',
	'quiz',
	'general',
	'other',
];

const BADGE_RARITIES = ['common', 'rare', 'epic', 'legendary'];

const badgeSchema = new mongoose.Schema(
	{
		/** Mã nội bộ (slug): dùng khi gán thưởng theo thành tựu — duy nhất, không đổi sau khi phát hành */
		key: {
			type: String,
			required: [true, 'Badge key is required'],
			trim: true,
			lowercase: true,
			match: [/^[a-z0-9_]{2,64}$/, 'Invalid badge key'],
		},
		nameVi: {
			type: String,
			required: true,
			trim: true,
		},
		nameJa: {
			type: String,
			required: true,
			trim: true,
		},
		descriptionVi: {
			type: String,
			trim: true,
			default: '',
		},
		descriptionJa: {
			type: String,
			trim: true,
			default: '',
		},
		/** @deprecated Dùng iconImage — giữ để tương thích dữ liệu cũ */
		emoji: {
			type: String,
			trim: true,
			default: '',
		},
		/** Đường dẫn công khai `/uploads/badges/...` (ảnh vuông, nền trong suốt khuyến nghị) */
		iconImage: {
			type: String,
			trim: true,
			default: '',
		},
		category: {
			type: String,
			enum: BADGE_CATEGORIES,
			default: 'general',
		},
		rarity: {
			type: String,
			enum: BADGE_RARITIES,
			default: 'common',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		displayOrder: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

badgeSchema.index({ key: 1 }, { unique: true });
badgeSchema.index({ isActive: 1, displayOrder: 1 });
badgeSchema.index({ category: 1 });

export default mongoose.model('Badge', badgeSchema);
export { BADGE_CATEGORIES, BADGE_RARITIES };

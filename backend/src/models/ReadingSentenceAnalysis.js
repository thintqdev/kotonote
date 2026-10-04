import mongoose from 'mongoose';
import { READING_SENTENCE_ROLES } from '../constants/reading.js';

const partSchema = new mongoose.Schema(
	{
		ja: { type: String, default: '' },
		vi: { type: String, default: '' },
		implied: { type: Boolean, default: false },
		noteVi: { type: String, default: '' },
	},
	{ _id: false },
);

const componentSchema = new mongoose.Schema(
	{
		ja: { type: String, required: true },
		role: { type: String, enum: READING_SENTENCE_ROLES, default: 'modifier' },
		vi: { type: String, default: '' },
	},
	{ _id: false },
);

const grammarPointSchema = new mongoose.Schema(
	{
		pattern: { type: String, required: true },
		meaningVi: { type: String, default: '' },
		usageVi: { type: String, default: '' },
	},
	{ _id: false },
);

const sentenceSchema = new mongoose.Schema(
	{
		index: { type: Number, required: true, min: 0 },
		textJa: { type: String, required: true },
		referenceVi: { type: String, default: '' },
		subject: { type: partSchema, default: () => ({}) },
		predicate: { type: partSchema, default: () => ({}) },
		components: { type: [componentSchema], default: [] },
		structureVi: { type: String, default: '' },
		grammarPoints: { type: [grammarPointSchema], default: [] },
	},
	{ _id: false },
);

/**
 * Phân tích từng câu của một bài đọc, dùng chung cho mọi học viên.
 * `contentHash` đổi khi nội dung bài đổi → phân tích cũ bị bỏ và tạo lại dần.
 */
const readingSentenceAnalysisSchema = new mongoose.Schema(
	{
		articleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ReadingArticle',
			required: true,
			unique: true,
		},
		contentHash: { type: String, required: true },
		sentences: { type: [sentenceSchema], default: [] },
	},
	{ timestamps: true },
);

export default mongoose.model('ReadingSentenceAnalysis', readingSentenceAnalysisSchema);

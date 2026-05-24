import mongoose from 'mongoose';
import {
	EXAM_JLPT_LEVELS,
	EXAM_QUESTION_TYPES,
	EXAM_SECTION_TYPES,
	EXAM_SOURCE_TYPES,
} from '../constants/examPaper.js';

const examQuestionSchema = new mongoose.Schema(
	{
		questionNumber: { type: Number, default: 0, min: 0 },
		questionJa: { type: String, default: '', trim: true, maxlength: 2000 },
		questionVi: { type: String, default: '', trim: true, maxlength: 2000 },
		questionType: {
			type: String,
			enum: EXAM_QUESTION_TYPES,
			default: 'multiple_choice',
		},
		choices: { type: [String], default: [] },
		choiceImages: { type: [String], default: [] },
		/** Ảnh minh họa câu hỏi (nghe hiểu — biểu đồ, hình tình huống…) */
		mediaUrl: { type: String, default: '', trim: true, maxlength: 500 },
		answerIndex: { type: Number, default: 0, min: 0, max: 10 },
		explainVi: { type: String, default: '', trim: true, maxlength: 4000 },
		explainJa: { type: String, default: '', trim: true, maxlength: 4000 },
		points: { type: Number, default: 1, min: 0 },
	},
	{ _id: false },
);

const examReadingPassageBlockSchema = new mongoose.Schema(
	{
		passageJa: { type: String, default: '', maxlength: 50_000 },
		passageVi: { type: String, default: '', maxlength: 50_000 },
		audioUrl: { type: String, default: '', trim: true, maxlength: 500 },
		/** Ảnh tài liệu (情報検索…) — ưu tiên hơn imageUrl legacy */
		mediaUrl: { type: String, default: '', trim: true, maxlength: 500 },
		imageUrl: { type: String, default: '', trim: true, maxlength: 500 },
		questions: { type: [examQuestionSchema], default: [] },
	},
	{ _id: false },
);

const examSectionSchema = new mongoose.Schema(
	{
		sectionType: {
			type: String,
			enum: EXAM_SECTION_TYPES,
			required: true,
		},
		partType: {
			type: String,
			required: true,
			trim: true,
		},
		titleVi: { type: String, default: '', trim: true, maxlength: 200 },
		titleJa: { type: String, default: '', trim: true, maxlength: 200 },
		descriptionVi: { type: String, default: '', trim: true, maxlength: 2000 },
		order: { type: Number, default: 0, min: 0 },
		timeLimitMinutes: { type: Number, default: 0, min: 0 },
		passageJa: { type: String, default: '', maxlength: 50_000 },
		passageVi: { type: String, default: '', maxlength: 50_000 },
		audioUrl: { type: String, default: '', trim: true, maxlength: 500 },
		imageUrl: { type: String, default: '', trim: true, maxlength: 500 },
		passages: { type: [examReadingPassageBlockSchema], default: [] },
		questions: { type: [examQuestionSchema], default: [] },
	},
	{ _id: false },
);

const examPaperSchema = new mongoose.Schema(
	{
		titleVi: {
			type: String,
			required: [true, 'titleVi is required'],
			trim: true,
			maxlength: 200,
		},
		titleJa: { type: String, default: '', trim: true, maxlength: 200 },
		year: {
			type: Number,
			required: true,
			min: 1984,
			max: 2100,
		},
		session: {
			type: String,
			enum: ['july', 'december'],
			required: true,
		},
		jlpt: {
			type: String,
			enum: EXAM_JLPT_LEVELS,
			required: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			maxlength: 120,
		},
		descriptionVi: { type: String, default: '', trim: true, maxlength: 4000 },
		descriptionJa: { type: String, default: '', trim: true, maxlength: 4000 },
		durationMinutes: { type: Number, default: 0, min: 0 },
		sections: { type: [examSectionSchema], default: [] },
		questionCount: { type: Number, default: 0, min: 0 },
		sourceType: {
			type: String,
			enum: EXAM_SOURCE_TYPES,
			default: 'past_exam',
		},
		sourceNote: { type: String, default: '', trim: true, maxlength: 500 },
		thumbnailUrl: { type: String, default: '', trim: true, maxlength: 500 },
		/** Audio chung cho toàn khối nghe hiểu (ngoài các part) */
		listeningAudioUrl: { type: String, default: '', trim: true, maxlength: 500 },
		isPublished: { type: Boolean, default: false },
		displayOrder: { type: Number, default: 0, min: 0 },
	},
	{ timestamps: true },
);

examPaperSchema.index({ jlpt: 1, year: -1, session: 1 });
examPaperSchema.index({ isPublished: 1, displayOrder: 1 });
examPaperSchema.index(
	{ jlpt: 1, year: 1, session: 1 },
	{ unique: true },
);

export default mongoose.model('ExamPaper', examPaperSchema);

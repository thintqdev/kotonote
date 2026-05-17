import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS, GRAMMAR_TAG_IDS } from '../constants/grammar.js';

const locSchema = new mongoose.Schema(
	{
		ja: { type: String, default: '' },
		vi: { type: String, default: '' },
	},
	{ _id: false },
);

const exampleSchema = new mongoose.Schema(
	{
		ja: { type: String, default: '' },
		vi: { type: String, default: '' },
	},
	{ _id: false },
);

const compareRowSchema = new mongoose.Schema(
	{
		label: { type: locSchema, default: () => ({}) },
		cells: { type: [locSchema], default: [] },
	},
	{ _id: false },
);

const grammarSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		jlpt: {
			type: String,
			required: true,
			enum: GRAMMAR_JLPT_LEVELS,
		},
		pattern: {
			type: String,
			required: true,
			trim: true,
		},
		tagIds: {
			type: [{ type: String, enum: GRAMMAR_TAG_IDS }],
			default: [],
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		displayOrder: {
			type: Number,
			default: 0,
		},
		teaser: { type: locSchema, default: () => ({}) },
		topicRibbon: { type: locSchema, default: () => ({}) },
		connection: { type: locSchema, default: () => ({}) },
		meaning: { type: locSchema, default: () => ({}) },
		usage: { type: locSchema, default: () => ({}) },
		usageNote: { type: locSchema, default: () => ({}) },
		pointBubble: { type: locSchema, default: () => ({}) },
		examples: { type: [exampleSchema], default: [] },
		ng: {
			ja: { type: [String], default: [] },
			vi: { type: [String], default: [] },
		},
		ngNote: { type: locSchema, default: () => ({}) },
		compare: {
			caption: { type: locSchema, default: () => ({}) },
			colLabels: { type: [locSchema], default: [] },
			rows: { type: [compareRowSchema], default: [] },
		},
		memo: { type: locSchema, default: () => ({}) },
		practice: {
			items: { type: [locSchema], default: [] },
		},
	},
	{ timestamps: true },
);

grammarSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
grammarSchema.index({ jlpt: 1 });
grammarSchema.index({ tagIds: 1 });
grammarSchema.index({ pattern: 'text', 'teaser.ja': 'text', 'teaser.vi': 'text' });

export default mongoose.model('Grammar', grammarSchema);

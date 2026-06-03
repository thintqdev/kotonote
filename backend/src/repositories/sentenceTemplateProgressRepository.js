import SentenceTemplateProgress from '../models/SentenceTemplateProgress.js';

export const findProgressByUserAndTemplate = async (userId, templateId) =>
	SentenceTemplateProgress.findOne({ userId, templateId }).lean();

export const findProgressByUserAndTemplates = async (userId, templateIds) => {
	if (!templateIds?.length) return [];
	return SentenceTemplateProgress.find({
		userId,
		templateId: { $in: templateIds },
	}).lean();
};

export const findProgressByUserAndSpecialty = async (userId, templateIds) => {
	if (!templateIds?.length) return [];
	return SentenceTemplateProgress.find({
		userId,
		templateId: { $in: templateIds },
	}).lean();
};

export const upsertProgress = async (userId, templateId, update) =>
	SentenceTemplateProgress.findOneAndUpdate(
		{ userId, templateId },
		{ $set: update },
		{ new: true, upsert: true, runValidators: true },
	).lean();

export const deleteProgressByTemplate = async (templateId) =>
	SentenceTemplateProgress.deleteMany({ templateId });

export const deleteProgressBySpecialtyTemplates = async (templateIds) => {
	if (!templateIds?.length) return;
	await SentenceTemplateProgress.deleteMany({ templateId: { $in: templateIds } });
};

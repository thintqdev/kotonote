import SentenceTemplate from '../models/SentenceTemplate.js';

export const findAllTemplates = async (filters = {}) => {
	const query = {};
	if (filters.specialtyId) query.specialtyId = filters.specialtyId;
	if (filters.isActive !== undefined) query.isActive = filters.isActive;
	return SentenceTemplate.find(query)
		.sort({ displayOrder: 1, createdAt: -1 })
		.populate('specialtyId', 'code nameVi nameJa')
		.lean();
};

export const findTemplatesBySpecialtyId = async (specialtyId, { activeOnly = true } = {}) => {
	const query = { specialtyId };
	if (activeOnly) query.isActive = true;
	return SentenceTemplate.find(query)
		.sort({ displayOrder: 1, createdAt: -1 })
		.lean();
};

export const findTemplateById = async (id) =>
	SentenceTemplate.findById(id).populate('specialtyId', 'code nameVi nameJa').lean();

export const createTemplate = async (data) => {
	const doc = await SentenceTemplate.create(data);
	return doc.toObject();
};

export const updateTemplate = async (id, data) =>
	SentenceTemplate.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const deleteTemplate = async (id) =>
	SentenceTemplate.findByIdAndDelete(id).lean();

export const upsertTemplateBySpecialtyAndCode = async (specialtyId, code, data) =>
	SentenceTemplate.findOneAndUpdate(
		{ specialtyId, code: String(code).trim().toLowerCase() },
		{ $set: { ...data, specialtyId, code: String(code).trim().toLowerCase() } },
		{ new: true, upsert: true, runValidators: true },
	).lean();

export const countTemplatesBySpecialty = async (specialtyId) =>
	SentenceTemplate.countDocuments({ specialtyId, isActive: true });

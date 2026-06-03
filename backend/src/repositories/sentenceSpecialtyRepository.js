import SentenceSpecialty from '../models/SentenceSpecialty.js';

export const findAllSpecialties = async (filters = {}) => {
	const query = {};
	if (filters.isActive !== undefined) query.isActive = filters.isActive;
	return SentenceSpecialty.find(query)
		.sort({ displayOrder: 1, createdAt: -1 })
		.lean();
};

export const findActiveSpecialties = async () =>
	findAllSpecialties({ isActive: true });

export const findSpecialtyById = async (id) =>
	SentenceSpecialty.findById(id).lean();

export const findSpecialtyByCode = async (code) =>
	SentenceSpecialty.findOne({ code: String(code).trim().toLowerCase() }).lean();

export const createSpecialty = async (data) => {
	const doc = await SentenceSpecialty.create(data);
	return doc.toObject();
};

export const updateSpecialty = async (id, data) =>
	SentenceSpecialty.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const deleteSpecialty = async (id) =>
	SentenceSpecialty.findByIdAndDelete(id).lean();

export const upsertSpecialtyByCode = async (code, data) =>
	SentenceSpecialty.findOneAndUpdate(
		{ code: String(code).trim().toLowerCase() },
		{ $set: data },
		{ new: true, upsert: true, runValidators: true },
	).lean();

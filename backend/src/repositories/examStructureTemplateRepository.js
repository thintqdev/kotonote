import ExamStructureTemplate from '../models/ExamStructureTemplate.js';

export const findAllTemplates = async (filters = {}) => {
	const query = {};
	if (filters.jlpt) query.jlpt = filters.jlpt;
	if (filters.isActive === true) query.isActive = true;
	return ExamStructureTemplate.find(query).sort({ jlpt: 1 }).lean();
};

export const findTemplateById = async (id) =>
	ExamStructureTemplate.findById(id).lean();

export const findDefaultTemplateByJlpt = async (jlpt) =>
	ExamStructureTemplate.findOne({
		jlpt,
		isDefault: true,
		isActive: true,
	}).lean();

export const findTemplateByCode = async (code) =>
	ExamStructureTemplate.findOne({ code }).lean();

export const createTemplate = async (data) => {
	const doc = new ExamStructureTemplate(data);
	return doc.save();
};

export const updateTemplateById = async (id, data) =>
	ExamStructureTemplate.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const upsertTemplateByCode = async (code, data) =>
	ExamStructureTemplate.findOneAndUpdate(
		{ code },
		{ $set: data },
		{ new: true, upsert: true, runValidators: true },
	).lean();

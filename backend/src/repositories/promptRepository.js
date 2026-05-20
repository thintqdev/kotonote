import Prompt from '../models/Prompt.js';

export const findAllPrompts = async (filters = {}) => {
	return await Prompt.find(filters).sort({ displayOrder: 1, type: 1, templateKey: 1 });
};

export const findPromptById = async (promptId) => {
	return await Prompt.findById(promptId);
};

export const findActivePromptByTypeAndKey = async (type, templateKey) => {
	const key = String(templateKey ?? '').trim().toLowerCase();
	if (!key) return null;
	return await Prompt.findOne({ type, templateKey: key, isActive: true });
};

export const findByTypeAndKey = async (type, templateKey) => {
	const key = String(templateKey ?? '').trim().toLowerCase();
	if (!key) return null;
	return await Prompt.findOne({ type, templateKey: key });
};

export const createPrompt = async (promptData) => {
	const prompt = new Prompt(promptData);
	return await prompt.save();
};

export const updatePrompt = async (promptId, updateData) => {
	return await Prompt.findByIdAndUpdate(promptId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deletePrompt = async (promptId) => {
	return await Prompt.findByIdAndDelete(promptId);
};

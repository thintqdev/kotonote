import * as promptRepository from '../repositories/promptRepository.js';
import { PROMPT } from '../constants/messages.js';

const normalizeTemplateKey = (key) => String(key ?? '').trim().toLowerCase();

export const getAllPrompts = async (filters = {}) => {
	return await promptRepository.findAllPrompts(filters);
};

export const getPromptById = async (promptId) => {
	const prompt = await promptRepository.findPromptById(promptId);

	if (!prompt) {
		throw { messageCode: PROMPT.NOT_FOUND, statusCode: 404 };
	}

	return prompt;
};

export const createPrompt = async (promptData) => {
	const templateKey = normalizeTemplateKey(promptData.templateKey);
	const existing = await promptRepository.findByTypeAndKey(promptData.type, templateKey);

	if (existing) {
		throw { messageCode: PROMPT.DUPLICATE_KEY, statusCode: 409 };
	}

	return await promptRepository.createPrompt({
		...promptData,
		templateKey,
	});
};

export const updatePrompt = async (promptId, updateData) => {
	const current = await promptRepository.findPromptById(promptId);

	if (!current) {
		throw { messageCode: PROMPT.NOT_FOUND, statusCode: 404 };
	}

	const nextType = updateData.type ?? current.type;
	const nextKey =
		updateData.templateKey !== undefined
			? normalizeTemplateKey(updateData.templateKey)
			: current.templateKey;

	if (updateData.templateKey !== undefined || updateData.type !== undefined) {
		const duplicate = await promptRepository.findByTypeAndKey(nextType, nextKey);
		if (duplicate && String(duplicate._id) !== String(promptId)) {
			throw { messageCode: PROMPT.DUPLICATE_KEY, statusCode: 409 };
		}
	}

	const payload = { ...updateData };
	if (updateData.templateKey !== undefined) {
		payload.templateKey = nextKey;
	}

	const prompt = await promptRepository.updatePrompt(promptId, payload);

	if (!prompt) {
		throw { messageCode: PROMPT.NOT_FOUND, statusCode: 404 };
	}

	return prompt;
};

export const deletePrompt = async (promptId) => {
	const prompt = await promptRepository.deletePrompt(promptId);

	if (!prompt) {
		throw { messageCode: PROMPT.NOT_FOUND, statusCode: 404 };
	}

	return prompt;
};

export const getActivePromptContent = async (type, templateKey) => {
	const prompt = await promptRepository.findActivePromptByTypeAndKey(type, templateKey);
	return prompt?.content ?? null;
};

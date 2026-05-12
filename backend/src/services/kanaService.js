import * as kanaRepository from '../repositories/kanaRepository.js';
import { KANA } from '../constants/messages.js';

export const getAllKana = async (filters = {}) => {
	return await kanaRepository.findAllKana(filters);
};

export const getKanaByScript = async (script, type = null) => {
	return await kanaRepository.findKanaByScript(script, type);
};

export const getKanaById = async (kanaId) => {
	const kana = await kanaRepository.findKanaById(kanaId);
	
	if (!kana) {
		throw { messageCode: KANA.NOT_FOUND, statusCode: 404 };
	}
	
	return kana;
};

export const createKana = async (kanaData) => {
	// Check if char already exists
	const existing = await kanaRepository.findKanaByChar(kanaData.char);
	
	if (existing) {
		throw { messageCode: KANA.CREATED, statusCode: 400, message: 'Character already exists' };
	}
	
	return await kanaRepository.createKana(kanaData);
};

export const updateKana = async (kanaId, updateData) => {
	const kana = await kanaRepository.updateKana(kanaId, updateData);
	
	if (!kana) {
		throw { messageCode: KANA.NOT_FOUND, statusCode: 404 };
	}
	
	return kana;
};

export const deleteKana = async (kanaId) => {
	const kana = await kanaRepository.deleteKana(kanaId);
	
	if (!kana) {
		throw { messageCode: KANA.NOT_FOUND, statusCode: 404 };
	}
	
	return kana;
};

export const getKanaGroupedByRow = async (script, type = null) => {
	const kanaList = await kanaRepository.findKanaByScript(script, type);
	
	// Group by rowKey
	const grouped = {};
	for (const kana of kanaList) {
		if (!grouped[kana.rowKey]) {
			grouped[kana.rowKey] = [];
		}
		grouped[kana.rowKey].push(kana);
	}
	
	return grouped;
};

export const bulkCreateKana = async (kanaArray) => {
	return await kanaRepository.bulkCreateKana(kanaArray);
};

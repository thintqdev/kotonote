import * as quoteRepository from '../repositories/quoteRepository.js';
import { QUOTE } from '../constants/messages.js';

export const getAllQuotes = async (filters = {}) => {
	return await quoteRepository.findAllQuotes(filters);
};

export const getActiveQuotes = async () => {
	return await quoteRepository.findActiveQuotes();
};

export const getRandomQuote = async () => {
	const quote = await quoteRepository.getRandomQuote();
	
	if (!quote) {
		throw { messageCode: QUOTE.NOT_FOUND, statusCode: 404 };
	}
	
	return quote;
};

export const getQuoteById = async (quoteId) => {
	const quote = await quoteRepository.findQuoteById(quoteId);
	
	if (!quote) {
		throw { messageCode: QUOTE.NOT_FOUND, statusCode: 404 };
	}
	
	return quote;
};

export const createQuote = async (quoteData) => {
	return await quoteRepository.createQuote(quoteData);
};

export const updateQuote = async (quoteId, updateData) => {
	const quote = await quoteRepository.updateQuote(quoteId, updateData);
	
	if (!quote) {
		throw { messageCode: QUOTE.NOT_FOUND, statusCode: 404 };
	}
	
	return quote;
};

export const deleteQuote = async (quoteId) => {
	const quote = await quoteRepository.deleteQuote(quoteId);
	
	if (!quote) {
		throw { messageCode: QUOTE.NOT_FOUND, statusCode: 404 };
	}
	
	return quote;
};

export const getQuotesByCategory = async (category) => {
	return await quoteRepository.getQuotesByCategory(category);
};

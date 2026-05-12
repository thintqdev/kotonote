import Quote from '../models/Quote.js';

export const findAllQuotes = async (filters = {}) => {
	return await Quote.find(filters).sort({ displayOrder: 1, createdAt: -1 });
};

export const findActiveQuotes = async () => {
	return await Quote.find({ isActive: true }).sort({ displayOrder: 1 });
};

export const findQuoteById = async (quoteId) => {
	return await Quote.findById(quoteId);
};

export const getRandomQuote = async () => {
	const quotes = await Quote.find({ isActive: true });
	if (quotes.length === 0) return null;
	const randomIndex = Math.floor(Math.random() * quotes.length);
	return quotes[randomIndex];
};

export const createQuote = async (quoteData) => {
	const quote = new Quote(quoteData);
	return await quote.save();
};

export const updateQuote = async (quoteId, updateData) => {
	return await Quote.findByIdAndUpdate(quoteId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deleteQuote = async (quoteId) => {
	return await Quote.findByIdAndDelete(quoteId);
};

export const getQuotesByCategory = async (category) => {
	return await Quote.find({ category, isActive: true }).sort({ displayOrder: 1 });
};

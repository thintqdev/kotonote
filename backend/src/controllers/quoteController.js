import asyncHandler from 'express-async-handler';
import * as quoteService from '../services/quoteService.js';
import { apiSuccess } from '../utils/response.js';
import { QUOTE } from '../constants/messages.js';

export const getAllQuotes = asyncHandler(async (req, res) => {
	const { category, isActive } = req.query;
	
	const filters = {};
	if (category) filters.category = category;
	if (isActive !== undefined) filters.isActive = isActive === 'true';
	
	const quotes = await quoteService.getAllQuotes(filters);
	
	return apiSuccess(res, { quotes, total: quotes.length }, QUOTE.LIST_FETCHED, 200);
});

export const getActiveQuotes = asyncHandler(async (req, res) => {
	const quotes = await quoteService.getActiveQuotes();
	
	return apiSuccess(res, { quotes, total: quotes.length }, QUOTE.LIST_FETCHED, 200);
});

export const getRandomQuote = asyncHandler(async (req, res) => {
	const quote = await quoteService.getRandomQuote();
	
	return apiSuccess(res, { quote }, QUOTE.FETCHED, 200);
});

export const getQuoteById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	const quote = await quoteService.getQuoteById(id);
	
	return apiSuccess(res, { quote }, QUOTE.FETCHED, 200);
});

export const createQuote = asyncHandler(async (req, res) => {
	const quoteData = req.body;
	
	const quote = await quoteService.createQuote(quoteData);
	
	return apiSuccess(res, { quote }, QUOTE.CREATED, 201);
});

export const updateQuote = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;
	
	const quote = await quoteService.updateQuote(id, updateData);
	
	return apiSuccess(res, { quote }, QUOTE.UPDATED, 200);
});

export const deleteQuote = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	await quoteService.deleteQuote(id);
	
	return apiSuccess(res, null, QUOTE.DELETED, 200);
});

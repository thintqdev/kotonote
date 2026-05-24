import path from 'path';
import multer from 'multer';
import { apiError } from './response.js';
import { COMMON } from '../constants/messages.js';
import { uploadBuffer } from '../services/objectStorageService.js';

/**
 * @param {import('multer').MulterError | Error | null} err
 * @param {string} field
 * @param {Record<string, string>} [customMessages]
 */
export function handleMulterError(err, res, field, customMessages = {}) {
	if (!err) return false;
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field, message: customMessages.LIMIT_FILE_SIZE || 'File too large' },
			]);
		}
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field, message: err.message },
		]);
	}
	if (customMessages[err.message]) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field, message: customMessages[err.message] },
		]);
	}
	return false;
}

/**
 * @param {import('express').Request} req
 * @param {Express.Multer.File} file
 * @param {{ folder: string, filename: string }} meta
 */
export async function persistUploadedFile(req, file, { folder, filename }) {
	const result = await uploadBuffer({
		folder,
		filename,
		buffer: file.buffer,
		contentType: file.mimetype,
	});
	req.file.publicPath = result.publicUrl;
	req.file.objectKey = result.objectKey;
	req.file.filename = filename;
}

/**
 * @param {{ field: string, maxSize: number, fileFilter: (req: any, file: Express.Multer.File, cb: (err?: Error | null, ok?: boolean) => void) => void, resolveMeta: (req: import('express').Request, file: Express.Multer.File) => { folder: string, filename: string }, customMessages?: Record<string, string> }} opts
 */
export function createMemoryFileUpload(opts) {
	const upload = multer({
		storage: multer.memoryStorage(),
		fileFilter: opts.fileFilter,
		limits: { fileSize: opts.maxSize },
	}).single(opts.field);

	return function memoryImageUploadMiddleware(req, res, next) {
		upload(req, res, async (err) => {
			const handled = handleMulterError(err, res, opts.field, opts.customMessages);
			if (handled) return;
			if (err) return next(err);
			if (!req.file) return next();
			try {
				const meta = opts.resolveMeta(req, req.file);
				await persistUploadedFile(req, req.file, meta);
				return next();
			} catch (e) {
				return next(e);
			}
		});
	};
}

/** @deprecated Alias — dùng createMemoryFileUpload */
export const createMemoryImageUpload = createMemoryFileUpload;

/** @param {Express.Multer.File} file */
export function imageExtFromFile(file, fallback = '.jpg') {
	const ext = path.extname(file.originalname || '').toLowerCase();
	const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
	return allowed.includes(ext) ? ext : fallback;
}

/** @param {Express.Multer.File} file */
export function badgeExtFromMimetype(file) {
	const mt = file.mimetype;
	if (mt === 'image/webp') return '.webp';
	if (mt === 'image/gif') return '.gif';
	if (mt === 'image/jpeg') return '.jpg';
	return '.png';
}

/** @param {Express.Multer.File} file */
export function audioExtFromFile(file, fallback = '.mp3') {
	const ext = path.extname(file.originalname || '').toLowerCase();
	const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.aac'];
	if (allowed.includes(ext)) return ext;
	if (file.mimetype === 'audio/wav') return '.wav';
	if (file.mimetype === 'audio/ogg') return '.ogg';
	if (file.mimetype === 'audio/webm') return '.webm';
	if (file.mimetype === 'audio/mp4' || file.mimetype === 'audio/x-m4a') return '.m4a';
	return fallback;
}

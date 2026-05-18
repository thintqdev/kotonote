import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** `<repo>/backend/uploads/reading` */
export const readingCoversUploadDir = path.join(
	__dirname,
	'..',
	'..',
	'uploads',
	'reading',
);

export function ensureReadingCoversUploadDir() {
	fs.mkdirSync(readingCoversUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, readingCoversUploadDir);
	},
	filename: (req, file, cb) => {
		const id = String(req.params?.id || 'draft').replace(/[^a-f0-9]/gi, '');
		const mt = file.mimetype;
		const ext =
			mt === 'image/webp'
				? '.webp'
				: mt === 'image/gif'
					? '.gif'
					: mt === 'image/jpeg'
						? '.jpg'
						: '.png';
		cb(null, `reading-${id || 'x'}-${Date.now()}${ext}`);
	},
});

const fileFilter = (_req, file, cb) => {
	const ok =
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/webp' ||
		file.mimetype === 'image/gif' ||
		file.mimetype === 'image/jpeg';
	if (ok) {
		cb(null, true);
	} else {
		cb(new Error('READING_COVER_TYPE'));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 2 * 1024 * 1024 },
}).single('cover');

export function readingCoverUploadMiddleware(req, res, next) {
	ensureReadingCoversUploadDir();
	upload(req, res, (err) => {
		if (!err) {
			return next();
		}
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return apiError(res, COMMON.VALIDATION_ERROR, 400, [
					{ field: 'cover', message: 'Image must be at most 2MB' },
				]);
			}
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'cover', message: err.message },
			]);
		}
		if (err.message === 'READING_COVER_TYPE') {
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{
					field: 'cover',
					message: 'Use PNG, WebP, GIF or JPEG',
				},
			]);
		}
		return next(err);
	});
}

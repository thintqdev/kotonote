import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Thư mục: `<repo>/backend/uploads/badges` — ảnh vuông, ưu tiên PNG/WebP (nền trong suốt). */
export const badgesUploadDir = path.join(__dirname, '..', '..', 'uploads', 'badges');

export function ensureBadgesUploadDir() {
	fs.mkdirSync(badgesUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, badgesUploadDir);
	},
	filename: (req, file, cb) => {
		const id = String(req.params?.id || 'badge').replace(/[^a-f0-9]/gi, '');
		const mt = file.mimetype;
		const ext =
			mt === 'image/webp'
				? '.webp'
				: mt === 'image/gif'
					? '.gif'
					: mt === 'image/jpeg'
						? '.jpg'
						: '.png';
		cb(null, `badge-${id || 'x'}-${Date.now()}${ext}`);
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
		cb(new Error('BADGE_ICON_TYPE'));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 2 * 1024 * 1024 },
}).single('icon');

export function badgeUploadMiddleware(req, res, next) {
	upload(req, res, (err) => {
		if (!err) {
			return next();
		}
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return apiError(res, COMMON.VALIDATION_ERROR, 400, [
					{ field: 'icon', message: 'Image must be at most 2MB' },
				]);
			}
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'icon', message: err.message },
			]);
		}
		if (err.message === 'BADGE_ICON_TYPE') {
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{
					field: 'icon',
					message: 'Use PNG, WebP, GIF or JPEG (square transparent PNG/WebP recommended)',
				},
			]);
		}
		return next(err);
	});
}

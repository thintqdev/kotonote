import path from 'path';
import {
	createMemoryFileUpload,
	imageExtFromFile,
} from '../utils/multerUpload.js';
import { FEEDBACK_MEDIA_MAX_BYTES } from '../constants/feedback.js';

/** Ảnh phổ biến + video ngắn (màn hình ghi log). */
const ALLOW_IMAGE = /^image\/(jpeg|png|gif|webp)$/;
const ALLOW_VIDEO = /^video\/(mp4|webm|quicktime)$/;

function feedbackFileExt(file) {
	const mt = file.mimetype || '';
	if (ALLOW_IMAGE.test(mt)) {
		return imageExtFromFile(file);
	}
	if (mt === 'video/quicktime') return '.mov';
	if (mt === 'video/webm') return '.webm';
	if (mt === 'video/mp4') return '.mp4';
	const ext = path.extname(file.originalname || '').toLowerCase();
	if (['.mp4', '.webm', '.mov'].includes(ext)) return ext;
	return '.bin';
}

export const feedbackMediaUploadMiddleware = createMemoryFileUpload({
	field: 'file',
	maxSize: FEEDBACK_MEDIA_MAX_BYTES,
	fileFilter: (_req, file, cb) => {
		const mt = file.mimetype || '';
		const ok =
			ALLOW_IMAGE.test(mt) ||
			ALLOW_VIDEO.test(mt);
		if (ok) cb(null, true);
		else cb(new Error('ONLY_IMAGE_OR_VIDEO'));
	},
	resolveMeta: (req, file) => {
		const ext = feedbackFileExt(file);
		return {
			folder: `feedback/${req.user._id}`,
			filename: `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`,
		};
	},
	customMessages: {
		ONLY_IMAGE_OR_VIDEO: 'Only JPEG/PNG/GIF/WebP images or MP4/WebM/MOV videos are allowed',
		LIMIT_FILE_SIZE: `File must be at most ${Math.round(FEEDBACK_MEDIA_MAX_BYTES / (1024 * 1024))}MB`,
	},
});

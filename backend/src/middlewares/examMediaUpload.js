import {
	audioExtFromFile,
	createMemoryFileUpload,
	imageExtFromFile,
} from '../utils/multerUpload.js';

export const examMediaUploadMiddleware = createMemoryFileUpload({
	field: 'media',
	maxSize: 8 * 1024 * 1024,
	fileFilter: (_req, file, cb) => {
		const mt = file.mimetype || '';
		if (mt.startsWith('audio/') || mt.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('ONLY_MEDIA'));
		}
	},
	resolveMeta: (_req, file) => {
		const isAudio = (file.mimetype || '').startsWith('audio/');
		if (isAudio) {
			return {
				folder: 'exam/media/audio',
				filename: `audio-${Date.now()}-${Math.round(Math.random() * 1e6)}${audioExtFromFile(file)}`,
			};
		}
		return {
			folder: 'exam/media/image',
			filename: `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${imageExtFromFile(file)}`,
		};
	},
	customMessages: {
		ONLY_MEDIA: 'Chỉ chấp nhận file ảnh hoặc audio',
		LIMIT_FILE_SIZE: 'Media tối đa 8MB',
	},
});

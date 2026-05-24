import {
	audioExtFromFile,
	createMemoryFileUpload,
} from '../utils/multerUpload.js';

export const listeningAudioUploadMiddleware = createMemoryFileUpload({
	field: 'audio',
	maxSize: 8 * 1024 * 1024,
	fileFilter: (_req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith('audio/')) {
			cb(null, true);
		} else {
			cb(new Error('ONLY_AUDIO'));
		}
	},
	resolveMeta: (_req, file) => ({
		folder: 'listening/audio',
		filename: `audio-${Date.now()}-${Math.round(Math.random() * 1e6)}${audioExtFromFile(file)}`,
	}),
	customMessages: {
		ONLY_AUDIO: 'Only audio files are allowed (MP3, WAV, OGG, …)',
		LIMIT_FILE_SIZE: 'Audio must be at most 8MB',
	},
});

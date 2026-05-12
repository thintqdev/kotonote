import { schemas } from './schemas.js';
import { authPaths } from './paths/auth.js';
import { userPaths } from './paths/users.js';
import { surveyPaths } from './paths/surveys.js';
import { quotePaths } from './paths/quotes.js';
import { vocabularyPaths } from './paths/vocabulary.js';
import { kanaPaths } from './paths/kana.js';
import { kanjiPaths } from './paths/kanji.js';
import { aiPaths } from './paths/ai.js';
import { streakPaths } from './paths/streaks.js';
import { systemPaths } from './paths/system.js';

export const openApiSpec = {
	openapi: '3.1.0',
	info: {
		title: 'Kotonote Nihongo API',
		version: '1.0.0',
		description: 'API documentation for Kotonote Nihongo application',
	},
	servers: [
		{
			url: 'http://localhost:5000',
			description: 'Development server',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas,
		responses: {
			Unauthorized: {
				description: 'Unauthorized - Invalid or missing token',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Error' },
					},
				},
			},
			Forbidden: {
				description: 'Forbidden - Admin only',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Error' },
					},
				},
			},
			NotFound: {
				description: 'Resource not found',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Error' },
					},
				},
			},
		},
	},
	paths: {
		...authPaths,
		...userPaths,
		...surveyPaths,
		...quotePaths,
		...vocabularyPaths,
		...kanaPaths,
		...kanjiPaths,
		...aiPaths,
		...streakPaths,
		...systemPaths,
	},
};

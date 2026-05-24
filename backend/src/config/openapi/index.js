import { schemas } from './schemas.js';
import { authPaths } from './paths/auth.js';
import { userPaths } from './paths/users.js';
import { surveyPaths } from './paths/surveys.js';
import { quotePaths } from './paths/quotes.js';
import { vocabularyPaths } from './paths/vocabulary.js';
import { vocabularyProgressPaths } from './paths/vocabularyProgress.js';
import { adminVocabularyImportPaths } from './paths/adminVocabularyImport.js';
import { adminVocabularyGeneratePaths } from './paths/adminVocabularyGenerate.js';
import { kanjiPaths } from './paths/kanji.js';
import { kanjiProgressPaths } from './paths/kanjiProgress.js';
import { aiPaths } from './paths/ai.js';
import { streakPaths } from './paths/streaks.js';
import { grammarPaths } from './paths/grammar.js';
import { adminGrammarPaths } from './paths/adminGrammar.js';
import { readingPaths } from './paths/reading.js';
import { adminReadingPaths } from './paths/adminReading.js';
import { listeningPaths } from './paths/listening.js';
import { adminListeningPaths } from './paths/adminListening.js';
import { adminListeningUploadPaths } from './paths/adminListeningUpload.js';
import { membershipPaths } from './paths/membership.js';
import { notebookPaths } from './paths/notebook.js';
import { journalPaths } from './paths/journal.js';
import { adminExamPaperPaths } from './paths/adminExamPapers.js';
import { notificationPaths } from './paths/notifications.js';
import { adminNotificationPaths } from './paths/adminNotifications.js';
import { adminBadgePaths } from './paths/adminBadges.js';
import { adminPromptPaths } from './paths/adminPrompts.js';
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
			url: 'http://localhost:8000',
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
		...vocabularyProgressPaths,
		...adminVocabularyImportPaths,
		...adminVocabularyGeneratePaths,
		...kanjiPaths,
		...kanjiProgressPaths,
		...aiPaths,
		...streakPaths,
		...grammarPaths,
		...adminGrammarPaths,
		...readingPaths,
		...adminReadingPaths,
		...listeningPaths,
		...adminListeningPaths,
		...adminListeningUploadPaths,
		...membershipPaths,
		...notebookPaths,
		...journalPaths,
		...adminExamPaperPaths,
		...notificationPaths,
		...adminNotificationPaths,
		...adminBadgePaths,
		...adminPromptPaths,
		...systemPaths,
	},
};

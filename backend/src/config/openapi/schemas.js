export const schemas = {
	Error: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: false },
			messageCode: { type: 'string', example: 'MSG_002' },
			errors: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						field: { type: 'string' },
						message: { type: 'string' },
					},
				},
			},
		},
	},
	ProfileFocusAreas: {
		type: 'object',
		properties: {
			selectedKeys: {
				type: 'array',
				items: { type: 'string', enum: ['grammar', 'vocab', 'kanji', 'reading', 'listening'] },
			},
			maxSelectable: { type: 'integer', example: 4 },
			options: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						key: { type: 'string' },
						route: { type: 'string', example: '/grammar' },
					},
				},
			},
		},
	},
	UserSettings: {
		type: 'object',
		properties: {
			notifications: {
				type: 'object',
				properties: {
					emailDigest: { type: 'boolean', example: true },
					dailyStudyReminder: { type: 'boolean', example: true },
					weeklyReport: { type: 'boolean', example: false },
				},
			},
			study: {
				type: 'object',
				properties: {
					dailyGoalMinutes: {
						type: 'integer',
						enum: [15, 30, 45, 60],
						example: 30,
					},
					reminderEnabled: { type: 'boolean', example: true },
					reminderTime: { type: 'string', example: '20:00' },
					reminderWeekends: { type: 'boolean', example: true },
				},
			},
			privacy: {
				type: 'object',
				properties: {
					analyticsOptIn: { type: 'boolean', example: false },
				},
			},
		},
	},
	LearningSummary: {
		type: 'object',
		properties: {
			streak: {
				type: 'object',
				properties: {
					current: { type: 'integer', example: 5 },
					longest: { type: 'integer', example: 12 },
					checkedThisWeek: { type: 'integer', example: 3 },
					weekCheckIns: {
						type: 'array',
						items: { type: 'boolean' },
						minItems: 7,
						maxItems: 7,
					},
				},
			},
			exam: {
				type: 'object',
				properties: {
					hasGoal: { type: 'boolean', example: true },
					examTypeKey: { type: 'string', example: 'jlpt' },
					examLevelKey: { type: 'string', example: 'n3' },
					examDateIso: { type: 'string', example: '2026-07-05' },
					daysUntilExam: { type: 'integer', nullable: true, example: 50 },
				},
			},
			badges: {
				type: 'object',
				properties: {
					unlockedCount: { type: 'integer', example: 2 },
					latest: {
						type: 'object',
						nullable: true,
						properties: {
							key: { type: 'string', example: 'streak_7' },
							nameVi: { type: 'string' },
							nameJa: { type: 'string' },
							emoji: { type: 'string', example: '🔥' },
							iconImage: { type: 'string' },
						},
					},
				},
			},
			library: {
				type: 'object',
				properties: {
					vocabularyDecksActive: { type: 'integer', example: 27 },
					kanjiDecksActive: { type: 'integer', example: 15 },
					grammarLessonsPublished: { type: 'integer', example: 40 },
				},
			},
		},
	},
	UserProfile: {
		type: 'object',
		properties: {
			readingName: { type: 'string', example: 'ヤマダ タロウ' },
			title: { type: 'string', example: 'JLPT learner' },
			location: { type: 'string', example: 'Ho Chi Minh City' },
			timeZoneLabel: { type: 'string', example: 'GMT+7' },
			bio: { type: 'string' },
			examTypeKey: { type: 'string', enum: ['jlpt', 'nat', 'jtest', 'topj', 'eju', 'other'], example: 'jlpt' },
			examLevelKey: { type: 'string', example: 'n3' },
			examDateIso: { type: 'string', example: '2026-07-05' },
			examOtherNote: { type: 'string', example: '' },
		},
	},
	User: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			email: { type: 'string', example: 'user@example.com' },
			name: { type: 'string', example: 'Nguyen Van A' },
			avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
			profile: { $ref: '#/components/schemas/UserProfile' },
			authProvider: { type: 'string', enum: ['local', 'google'], example: 'local' },
			role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
			status: { type: 'string', enum: ['active', 'locked', 'suspended'], example: 'active' },
			isActive: { type: 'boolean', example: true },
			isEmailVerified: { type: 'boolean', example: true },
			lastLogin: { type: 'string', format: 'date-time' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	UserStatistics: {
		type: 'object',
		properties: {
			totalUsers: { type: 'number', example: 1250 },
			activeUsers: { type: 'number', example: 1100 },
			lockedUsers: { type: 'number', example: 50 },
			suspendedUsers: { type: 'number', example: 100 },
			googleUsers: { type: 'number', example: 800 },
			localUsers: { type: 'number', example: 450 },
			verifiedUsers: { type: 'number', example: 1000 },
			recentUsers: { type: 'number', example: 150 },
			usersByStatus: {
				type: 'object',
				properties: {
					active: { type: 'number', example: 1100 },
					locked: { type: 'number', example: 50 },
					suspended: { type: 'number', example: 100 },
				},
			},
			usersByProvider: {
				type: 'object',
				properties: {
					google: { type: 'number', example: 800 },
					local: { type: 'number', example: 450 },
				},
			},
		},
	},
		Survey: {
			type: 'object',
			properties: {
				_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
				userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
				level: { type: 'string', enum: ['begin', 'n5', 'n4', 'n3', 'n2up'], example: 'n3' },
				goal: { type: 'string', enum: ['jlpt', 'travel', 'work', 'school', 'hobby'], example: 'jlpt' },
				dailyTime: { type: 'string', enum: ['lt15', '15-30', '30-60', 'gt60'], example: '30-60' },
				weakAreas: {
					type: 'array',
					items: { type: 'string', enum: ['grammar', 'vocab', 'kanji', 'listen', 'read'] },
					example: ['grammar', 'kanji'],
				},
				discovery: { type: 'string', enum: ['friend', 'sns', 'search', 'other'], example: 'search' },
				discoveryNote: { type: 'string', example: 'Found via Google search' },
				freeNote: { type: 'string', example: 'Looking forward to learning Japanese' },
				completedAt: { type: 'string', format: 'date-time' },
				createdAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' },
			},
		},
		SurveyChartBucket: {
			type: 'object',
			description: 'Một cột trên biểu đồ (nhãn + số lượng)',
			properties: {
				key: {
					type: 'string',
					description: 'Mã hạng mục (level, goal, dailyTime, discovery, weakArea)',
					example: 'n5',
				},
				count: { type: 'integer', minimum: 0, example: 24 },
			},
			required: ['key', 'count'],
		},
		SurveyStatistics: {
			type: 'object',
			description: 'Thống kê khảo sát theo từng trục — dùng labels = key, values = count',
			properties: {
				totalSurveys: { type: 'integer', minimum: 0, example: 150 },
				byLevel: {
					type: 'array',
					items: { $ref: '#/components/schemas/SurveyChartBucket' },
				},
				byGoal: {
					type: 'array',
					items: { $ref: '#/components/schemas/SurveyChartBucket' },
				},
				byDailyTime: {
					type: 'array',
					items: { $ref: '#/components/schemas/SurveyChartBucket' },
				},
				byDiscovery: {
					type: 'array',
					items: { $ref: '#/components/schemas/SurveyChartBucket' },
					description: 'Key `unspecified` = khảo sát không có discovery',
				},
				byWeakArea: {
					type: 'array',
					items: { $ref: '#/components/schemas/SurveyChartBucket' },
					description: 'Số lần hạng mục được chọn (một user có thể chọn nhiều)',
				},
			},
			required: [
				'totalSurveys',
				'byLevel',
				'byGoal',
				'byDailyTime',
				'byDiscovery',
				'byWeakArea',
			],
		},
	Quote: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			quoteVi: { type: 'string', example: 'Học tập là món quà dành cho chính bạn trong tương lai.' },
			quoteJa: { type: 'string', example: '学ぶことは、未来の自分への贈り物です。' },
			author: { type: 'string', example: 'Lão Tử' },
			category: {
				type: 'string',
				enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
				example: 'learning',
			},
			isActive: { type: 'boolean', example: true },
			displayOrder: { type: 'number', example: 1 },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	Streak: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
			currentStreak: { type: 'number', example: 15 },
			longestStreak: { type: 'number', example: 30 },
			totalCheckIns: { type: 'number', example: 45 },
			lastCheckIn: { type: 'string', format: 'date-time' },
			freezeCount: { type: 'number', example: 2 },
			checkInHistory: {
				type: 'array',
				items: { type: 'string', format: 'date' },
			},
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	VocabularyDeck: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			title: { type: 'string', example: 'Từ vựng cơ bản N5' },
			titleJa: { type: 'string', example: 'N5基本語彙' },
			description: { type: 'string', example: 'Từ vựng cơ bản cho người mới bắt đầu' },
			descriptionJa: { type: 'string', example: '初心者向けの基本語彙' },
			level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'], example: 'n5' },
			category: {
				type: 'string',
				enum: ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'],
				example: 'basic',
			},
			thumbnail: { type: 'string', nullable: true, example: 'https://example.com/cover.jpg' },
			totalWords: { type: 'number', example: 12 },
			displayOrder: { type: 'number', example: 1 },
			isActive: { type: 'boolean', example: true },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	VocabularyDeckListItem: {
		allOf: [
			{ $ref: '#/components/schemas/VocabularyDeck' },
			{
				type: 'object',
				properties: {
					wordCount: {
						type: 'integer',
						minimum: 0,
						description: 'Số từ vựng isActive trong deck (đếm thực tế)',
						example: 12,
					},
				},
			},
		],
	},
	DeckListPagination: {
		type: 'object',
		properties: {
			page: { type: 'integer', minimum: 1, example: 1, description: 'Trang hiện tại (bắt đầu từ 1)' },
			limit: { type: 'integer', minimum: 1, maximum: 100, example: 50, description: 'Số deck mỗi trang' },
			total: { type: 'integer', minimum: 0, example: 42, description: 'Tổng số deck thỏa bộ lọc' },
			pages: { type: 'integer', minimum: 0, example: 1, description: 'Tổng số trang' },
		},
	},
	Vocabulary: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			deckId: { type: 'string', example: '507f1f77bcf86cd799439011' },
			word: { type: 'string', example: '学生' },
			reading: { type: 'string', example: 'がくせい' },
			meaning: { type: 'string', example: 'học sinh, sinh viên' },
			meaningJa: { type: 'string', example: '学校で勉強する人' },
			partOfSpeech: {
				type: 'string',
				enum: ['noun', 'verb', 'adjective', 'adverb', 'particle', 'other'],
				example: 'noun',
			},
			example: { type: 'string', example: '私は学生です。' },
			exampleReading: { type: 'string', example: 'わたしはがくせいです。' },
			exampleMeaning: { type: 'string', example: 'Tôi là sinh viên.' },
			audioUrl: { type: 'string', nullable: true },
			imageUrl: { type: 'string', nullable: true },
			displayOrder: { type: 'number', example: 1 },
			isActive: { type: 'boolean', example: true },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	KanjiDeck: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			titleVi: { type: 'string', example: 'Kanji cơ bản N5' },
			titleJa: { type: 'string', example: 'N5基本漢字' },
			descriptionVi: { type: 'string', example: 'Kanji cơ bản cho người mới bắt đầu' },
			descriptionJa: { type: 'string', example: '初心者向けの基本漢字' },
			level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'], example: 'n5' },
			kanjiCount: { type: 'number', example: 25 },
			displayOrder: { type: 'number', example: 1 },
			isActive: { type: 'boolean', example: true },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	Kanji: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			deckId: { type: 'string', example: '507f1f77bcf86cd799439011' },
			char: { type: 'string', example: '学' },
			onYomi: { type: 'string', example: 'ガク' },
			kunYomi: { type: 'string', example: 'まな.ぶ' },
			hanViet: { type: 'string', example: 'Học' },
			meaningVi: { type: 'string', example: 'học, học tập' },
			vocabJa: { type: 'string', example: '学生（がくせい）、学校（がっこう）' },
			exampleJa: { type: 'string', example: '学校で勉強します。' },
			exampleVi: { type: 'string', example: 'Học ở trường.' },
			displayOrder: { type: 'number', example: 1 },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	GrammarLoc: {
		type: 'object',
		properties: {
			ja: { type: 'string', example: '普通形 ＋ によると' },
			vi: { type: 'string', example: 'Thể thường + によると' },
		},
	},
	GrammarExample: {
		type: 'object',
		properties: {
			ja: { type: 'string', example: '天気予報によると、明日は雪だそうです。' },
			vi: { type: 'string', example: 'Theo dự báo thời tiết, ngày mai có tuyết.' },
		},
	},
	Grammar: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			slug: { type: 'string', example: 'ni-yoru-to' },
			jlpt: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'], example: 'N3' },
			pattern: { type: 'string', example: '～によると' },
			tagIds: {
				type: 'array',
				items: {
					type: 'string',
					enum: ['hearsay', 'formal', 'conjecture', 'purpose', 'goal', 'change'],
				},
				example: ['hearsay', 'formal'],
			},
			isPublished: { type: 'boolean', example: true },
			displayOrder: { type: 'number', example: 0 },
			teaser: { $ref: '#/components/schemas/GrammarLoc' },
			topicRibbon: { $ref: '#/components/schemas/GrammarLoc' },
			connection: { $ref: '#/components/schemas/GrammarLoc' },
			meaning: { $ref: '#/components/schemas/GrammarLoc' },
			usage: { $ref: '#/components/schemas/GrammarLoc' },
			usageNote: { $ref: '#/components/schemas/GrammarLoc' },
			pointBubble: { $ref: '#/components/schemas/GrammarLoc' },
			examples: {
				type: 'array',
				items: { $ref: '#/components/schemas/GrammarExample' },
			},
			ng: {
				type: 'object',
				properties: {
					ja: { type: 'array', items: { type: 'string' } },
					vi: { type: 'array', items: { type: 'string' } },
				},
			},
			ngNote: { $ref: '#/components/schemas/GrammarLoc' },
			memo: { $ref: '#/components/schemas/GrammarLoc' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	GrammarInput: {
		type: 'object',
		required: ['slug', 'jlpt', 'pattern'],
		properties: {
			slug: { type: 'string', example: 'ni-yoru-to' },
			jlpt: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
			pattern: { type: 'string', example: '～によると' },
			tagIds: { type: 'array', items: { type: 'string' } },
			isPublished: { type: 'boolean' },
			displayOrder: { type: 'number' },
			teaser: { $ref: '#/components/schemas/GrammarLoc' },
			topicRibbon: { $ref: '#/components/schemas/GrammarLoc' },
			connection: { $ref: '#/components/schemas/GrammarLoc' },
			meaning: { $ref: '#/components/schemas/GrammarLoc' },
			usage: { $ref: '#/components/schemas/GrammarLoc' },
			usageNote: { $ref: '#/components/schemas/GrammarLoc' },
			pointBubble: { $ref: '#/components/schemas/GrammarLoc' },
			examples: {
				type: 'array',
				items: { $ref: '#/components/schemas/GrammarExample' },
			},
			ng: {
				type: 'object',
				properties: {
					ja: { type: 'array', items: { type: 'string' } },
					vi: { type: 'array', items: { type: 'string' } },
				},
			},
			ngNote: { $ref: '#/components/schemas/GrammarLoc' },
			memo: { $ref: '#/components/schemas/GrammarLoc' },
			practice: {
				type: 'object',
				properties: {
					items: {
						type: 'array',
						items: { $ref: '#/components/schemas/GrammarLoc' },
					},
				},
			},
		},
	},
	ReadingGloss: {
		type: 'object',
		properties: {
			vi: { type: 'string' },
			ja: { type: 'string' },
		},
	},
	ReadingVocab: {
		type: 'object',
		properties: {
			termJa: { type: 'string' },
			gloss: { $ref: '#/components/schemas/ReadingGloss' },
		},
	},
	ReadingQuestion: {
		type: 'object',
		properties: {
			questionJa: { type: 'string' },
			choicesJa: { type: 'array', items: { type: 'string' } },
			answerIndex: { type: 'integer' },
			explainPerChoice: {
				type: 'object',
				properties: {
					ja: { type: 'array', items: { type: 'string' } },
					vi: { type: 'array', items: { type: 'string' } },
				},
			},
		},
	},
	ReadingArticle: {
		type: 'object',
		properties: {
			_id: { type: 'string' },
			slug: { type: 'string', example: 'r-seasons' },
			jlpt: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
			titleJa: { type: 'string' },
			snippetJa: { type: 'string' },
			wordCount: { type: 'number' },
			readingMinutes: { type: 'number' },
			rating: { type: 'number' },
			imageUrl: { type: 'string' },
			featured: { type: 'boolean' },
			isPublished: { type: 'boolean' },
			displayOrder: { type: 'number' },
			paragraphsJa: { type: 'array', items: { type: 'string' } },
			vocabulary: {
				type: 'array',
				items: { $ref: '#/components/schemas/ReadingVocab' },
			},
			questions: {
				type: 'array',
				items: { $ref: '#/components/schemas/ReadingQuestion' },
			},
			status: {
				type: 'string',
				enum: ['not_started', 'in_progress', 'done'],
			},
		},
	},
	ReadingArticleInput: {
		type: 'object',
		required: ['slug', 'jlpt', 'titleJa'],
		properties: {
			slug: { type: 'string' },
			jlpt: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
			titleJa: { type: 'string' },
			snippetJa: { type: 'string' },
			wordCount: { type: 'number' },
			readingMinutes: { type: 'number' },
			rating: { type: 'number' },
			imageUrl: { type: 'string' },
			featured: { type: 'boolean' },
			isPublished: { type: 'boolean' },
			displayOrder: { type: 'number' },
			paragraphsJa: { type: 'array', items: { type: 'string' } },
			vocabulary: {
				type: 'array',
				items: { $ref: '#/components/schemas/ReadingVocab' },
			},
			questions: {
				type: 'array',
				items: { $ref: '#/components/schemas/ReadingQuestion' },
			},
		},
	},
	ReadingListItem: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			slug: { type: 'string' },
			jlpt: { type: 'string' },
			titleJa: { type: 'string' },
			snippetJa: { type: 'string' },
			wordCount: { type: 'number' },
			readingMinutes: { type: 'number' },
			rating: { type: 'number' },
			imageUrl: { type: 'string' },
			featured: { type: 'boolean' },
			status: {
				type: 'string',
				enum: ['not_started', 'in_progress', 'done'],
			},
		},
	},
	ReadingSummary: {
		type: 'object',
		properties: {
			completed: { type: 'integer' },
			goal: { type: 'integer' },
			reviewCount: { type: 'integer' },
		},
	},
	ReadingProgress: {
		type: 'object',
		properties: {
			status: {
				type: 'string',
				enum: ['not_started', 'in_progress', 'done'],
			},
			questionAnswers: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						questionIndex: { type: 'integer' },
						choiceIndex: { type: 'integer' },
					},
				},
			},
		},
	},
	ReadingProgressInput: {
		type: 'object',
		properties: {
			status: {
				type: 'string',
				enum: ['not_started', 'in_progress', 'done'],
			},
			questionAnswers: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						questionIndex: { type: 'integer' },
						choiceIndex: { type: 'integer' },
					},
				},
			},
			recordAnswer: {
				type: 'object',
				properties: {
					questionIndex: { type: 'integer' },
					choiceIndex: { type: 'integer' },
				},
			},
		},
	},
};

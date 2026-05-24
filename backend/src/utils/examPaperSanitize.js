/** @param {Record<string, unknown>} question */
export function sanitizeQuestionForAttempt(question) {
	return {
		questionNumber: question.questionNumber ?? 0,
		questionJa: question.questionJa ?? '',
		questionVi: question.questionVi ?? '',
		questionType: question.questionType ?? 'multiple_choice',
		choices: question.choices ?? [],
		choiceImages: question.choiceImages ?? [],
		mediaUrl: String(question.mediaUrl ?? question.imageUrl ?? '').trim(),
		points: question.points ?? 1,
	};
}

/** @param {Record<string, unknown>} section */
export function sanitizeSectionForAttempt(section) {
	return {
		sectionType: section.sectionType,
		partType: section.partType,
		titleVi: section.titleVi ?? '',
		titleJa: section.titleJa ?? '',
		descriptionVi: section.descriptionVi ?? '',
		order: section.order ?? 0,
		timeLimitMinutes: section.timeLimitMinutes ?? 0,
		passageJa: section.passageJa ?? '',
		passageVi: section.passageVi ?? '',
		audioUrl: section.audioUrl ?? '',
		imageUrl: section.imageUrl ?? '',
		passages: (section.passages ?? []).map((block) => ({
			passageJa: block.passageJa ?? '',
			passageVi: block.passageVi ?? '',
			audioUrl: block.audioUrl ?? '',
			mediaUrl: block.mediaUrl ?? block.imageUrl ?? '',
			imageUrl: block.imageUrl ?? '',
			questions: (block.questions ?? []).map(sanitizeQuestionForAttempt),
		})),
		questions: (section.questions ?? []).map(sanitizeQuestionForAttempt),
	};
}

/** @param {Record<string, unknown>} paper */
export function sanitizeExamPaperForAttempt(paper) {
	if (!paper) return null;
	return {
		_id: paper._id,
		slug: paper.slug,
		titleVi: paper.titleVi,
		titleJa: paper.titleJa ?? '',
		jlpt: paper.jlpt,
		year: paper.year,
		session: paper.session,
		durationMinutes: paper.durationMinutes ?? 0,
		questionCount: paper.questionCount ?? 0,
		descriptionVi: paper.descriptionVi ?? '',
		descriptionJa: paper.descriptionJa ?? '',
		thumbnailUrl: paper.thumbnailUrl ?? '',
		listeningAudioUrl: String(paper.listeningAudioUrl ?? '').trim(),
		sourceType: paper.sourceType ?? 'past_exam',
		sections: (paper.sections ?? []).map(sanitizeSectionForAttempt),
	};
}

/** @param {Record<string, unknown>} paper */
export function toExamPaperListItem(paper) {
	return {
		_id: paper._id,
		slug: paper.slug,
		titleVi: paper.titleVi,
		titleJa: paper.titleJa ?? '',
		jlpt: paper.jlpt,
		year: paper.year,
		session: paper.session,
		questionCount: paper.questionCount ?? 0,
		durationMinutes: paper.durationMinutes ?? 0,
		descriptionVi: paper.descriptionVi ?? '',
		sourceType: paper.sourceType ?? 'past_exam',
		thumbnailUrl: paper.thumbnailUrl ?? '',
	};
}

export function buildExamAnswerKey(sectionType, partType, questionNumber) {
	return `${sectionType}:${partType}:${questionNumber}`;
}

/**
 * @param {Record<string, unknown>} paper
 * @param {Record<string, number>} answers
 */
export function gradeExamAttempt(paper, answers = {}) {
	let correct = 0;
	let total = 0;
	/** @type {Array<Record<string, unknown>>} */
	const results = [];

	for (const section of paper.sections ?? []) {
		const blocks =
			(section.sectionType === 'reading' || section.sectionType === 'listening') &&
			(section.passages?.length ?? 0) > 0
				? section.passages
				: [{ questions: section.questions ?? [] }];
		for (const block of blocks) {
			for (const q of block.questions ?? []) {
				total += 1;
				const key = buildExamAnswerKey(
					section.sectionType,
					section.partType,
					q.questionNumber ?? total,
				);
				const picked =
					answers[key] !== undefined && answers[key] !== null
						? Number(answers[key])
						: null;
				const answerIndex = Math.max(0, Number(q.answerIndex) || 0);
				const isCorrect = picked === answerIndex;
				if (isCorrect) correct += 1;

				results.push({
					key,
					sectionType: section.sectionType,
					partType: section.partType,
					questionNumber: q.questionNumber,
					questionJa: q.questionJa ?? '',
					questionVi: q.questionVi ?? '',
					choices: q.choices ?? [],
					pickedIndex: picked,
					answerIndex,
					isCorrect,
					explainVi: q.explainVi ?? '',
					explainJa: q.explainJa ?? '',
					points: q.points ?? 1,
				});
			}
		}
	}

	return {
		correct,
		total,
		scorePercent: total > 0 ? Math.round((correct / total) * 100) : 0,
		results,
	};
}

/**
 * Ẩn đáp án & giải thích cho gói miễn phí (xem tại trang review — gói trả phí).
 * @param {ReturnType<typeof gradeExamAttempt>} graded
 */
export function sanitizeExamResultForFree(graded) {
	return {
		correct: graded.correct,
		total: graded.total,
		scorePercent: graded.scorePercent,
		results: (graded.results ?? []).map((row) => ({
			key: row.key,
			sectionType: row.sectionType,
			partType: row.partType,
			questionNumber: row.questionNumber,
			isCorrect: row.isCorrect,
		})),
	};
}

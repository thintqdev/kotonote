export const READING_JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const emptyQuestion = () => ({
	questionJa: '',
	choices: ['', '', ''],
	answerIndex: 0,
	explainJa: ['', '', ''],
	explainVi: ['', '', ''],
});

export const emptyReadingForm = () => ({
	slug: '',
	jlpt: 'N3',
	titleJa: '',
	snippetJa: '',
	wordCount: 0,
	readingMinutes: 5,
	rating: 4.5,
	imageUrl: '',
	featured: false,
	isPublished: true,
	displayOrder: 0,
	paragraphsText: '',
	vocabulary: [{ termJa: '', glossVi: '', glossJa: '' }],
	questions: [emptyQuestion()],
});

export function articleToForm(article) {
	if (!article) return emptyReadingForm();
	return {
		slug: article.slug ?? '',
		jlpt: article.jlpt ?? 'N3',
		titleJa: article.titleJa ?? '',
		snippetJa: article.snippetJa ?? '',
		wordCount: article.wordCount ?? 0,
		readingMinutes: article.readingMinutes ?? 5,
		rating: article.rating ?? 4.5,
		imageUrl: article.imageUrl ?? '',
		featured: Boolean(article.featured),
		isPublished: article.isPublished !== false,
		displayOrder: article.displayOrder ?? 0,
		paragraphsText: (article.paragraphsJa ?? []).join('\n\n'),
		vocabulary: (article.vocabulary ?? []).length
			? article.vocabulary.map((v) => ({
					termJa: v.termJa ?? '',
					glossVi: v.gloss?.vi ?? '',
					glossJa: v.gloss?.ja ?? '',
				}))
			: [{ termJa: '', glossVi: '', glossJa: '' }],
		questions: (article.questions ?? []).length
			? article.questions.map((q) => ({
					questionJa: q.questionJa ?? '',
					choices: [...(q.choicesJa ?? ['', '', ''])],
					answerIndex: q.answerIndex ?? 0,
					explainJa: [...(q.explainPerChoice?.ja ?? ['', '', ''])],
					explainVi: [...(q.explainPerChoice?.vi ?? ['', '', ''])],
				}))
			: [emptyQuestion()],
	};
}

export function formToArticlePayload(form) {
	const paragraphsJa = String(form.paragraphsText || '')
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);

	const vocabulary = (form.vocabulary ?? [])
		.filter((v) => String(v.termJa || '').trim())
		.map((v) => ({
			termJa: v.termJa.trim(),
			gloss: {
				vi: String(v.glossVi || '').trim(),
				ja: String(v.glossJa || '').trim(),
			},
		}));

	const questions = (form.questions ?? [])
		.filter((q) => String(q.questionJa || '').trim())
		.map((q) => {
			const choicesJa = (q.choices ?? [])
				.map((c) => String(c || '').trim())
				.filter(Boolean);
			const n = choicesJa.length;
			const pad = (arr) => {
				const out = [...arr];
				while (out.length < n) out.push('');
				return out.slice(0, n);
			};
			return {
				questionJa: q.questionJa.trim(),
				choicesJa,
				answerIndex: Math.min(
					Math.max(0, Number(q.answerIndex) || 0),
					Math.max(0, n - 1),
				),
				explainPerChoice: {
					ja: pad(q.explainJa ?? []),
					vi: pad(q.explainVi ?? []),
				},
			};
		});

	return {
		slug: form.slug,
		jlpt: form.jlpt,
		titleJa: form.titleJa,
		snippetJa: form.snippetJa,
		wordCount: Number(form.wordCount) || 0,
		readingMinutes: Number(form.readingMinutes) || 5,
		rating: Number(form.rating) || 0,
		imageUrl: form.imageUrl,
		featured: Boolean(form.featured),
		isPublished: Boolean(form.isPublished),
		displayOrder: Number(form.displayOrder) || 0,
		paragraphsJa,
		vocabulary,
		questions,
	};
}

export { emptyQuestion };

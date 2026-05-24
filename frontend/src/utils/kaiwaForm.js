export const emptyKaiwaRole = () => ({
	nameVi: '',
	nameJa: '',
	descriptionVi: '',
	descriptionJa: '',
});

export const emptyKaiwaKeyPhrase = () => ({
	phraseJa: '',
	reading: '',
	meaningVi: '',
});

export const emptyKaiwaForm = () => ({
	titleVi: '',
	titleJa: '',
	jlpt: 'N5',
	category: 'daily',
	settingVi: '',
	settingJa: '',
	roles: [emptyKaiwaRole(), emptyKaiwaRole()],
	situationVi: '',
	situationJa: '',
	objectivesVi: '',
	objectivesJa: '',
	keyPhrases: [],
	culturalNotesVi: '',
	culturalNotesJa: '',
	isPublished: false,
	displayOrder: 0,
});

/**
 * @param {Record<string, unknown> | null | undefined} ctx
 */
export function contextToForm(ctx) {
	if (!ctx) return emptyKaiwaForm();
	return {
		titleVi: ctx.titleVi ?? '',
		titleJa: ctx.titleJa ?? '',
		jlpt: ctx.jlpt ?? 'N5',
		category: ctx.category ?? 'daily',
		settingVi: ctx.settingVi ?? '',
		settingJa: ctx.settingJa ?? '',
		roles:
			Array.isArray(ctx.roles) && ctx.roles.length > 0
				? ctx.roles.map((r) => ({
						nameVi: r.nameVi ?? '',
						nameJa: r.nameJa ?? '',
						descriptionVi: r.descriptionVi ?? '',
						descriptionJa: r.descriptionJa ?? '',
					}))
				: [emptyKaiwaRole()],
		situationVi: ctx.situationVi ?? '',
		situationJa: ctx.situationJa ?? '',
		objectivesVi: ctx.objectivesVi ?? '',
		objectivesJa: ctx.objectivesJa ?? '',
		keyPhrases: Array.isArray(ctx.keyPhrases)
			? ctx.keyPhrases.map((p) => ({
					phraseJa: p.phraseJa ?? '',
					reading: p.reading ?? '',
					meaningVi: p.meaningVi ?? '',
				}))
			: [],
		culturalNotesVi: ctx.culturalNotesVi ?? '',
		culturalNotesJa: ctx.culturalNotesJa ?? '',
		isPublished: ctx.isPublished === true,
		displayOrder: Number(ctx.displayOrder) || 0,
	};
}

/**
 * @param {ReturnType<typeof emptyKaiwaForm>} form
 */
export function formToContextPayload(form) {
	const roles = (form.roles ?? [])
		.filter((r) => r.nameVi?.trim() || r.nameJa?.trim())
		.map((r) => ({
			nameVi: r.nameVi.trim(),
			nameJa: r.nameJa.trim(),
			descriptionVi: r.descriptionVi.trim(),
			descriptionJa: r.descriptionJa.trim(),
		}));

	const keyPhrases = (form.keyPhrases ?? [])
		.filter((p) => p.phraseJa?.trim())
		.map((p) => ({
			phraseJa: p.phraseJa.trim(),
			reading: p.reading.trim(),
			meaningVi: p.meaningVi.trim(),
		}));

	return {
		titleVi: form.titleVi.trim(),
		titleJa: form.titleJa.trim(),
		jlpt: form.jlpt,
		category: form.category,
		settingVi: form.settingVi.trim(),
		settingJa: form.settingJa.trim(),
		roles,
		situationVi: form.situationVi.trim(),
		situationJa: form.situationJa.trim(),
		objectivesVi: form.objectivesVi.trim(),
		objectivesJa: form.objectivesJa.trim(),
		keyPhrases,
		culturalNotesVi: form.culturalNotesVi.trim(),
		culturalNotesJa: form.culturalNotesJa.trim(),
		isPublished: Boolean(form.isPublished),
		displayOrder: Number(form.displayOrder) || 0,
	};
}

/**
 * @param {ReturnType<typeof emptyKaiwaForm>} form
 * @param {Record<string, unknown>} ai
 */
export function mergeKaiwaAIIntoForm(form, ai) {
	if (!ai || typeof ai !== 'object') return form;
	const next = { ...form };
	if (ai.titleVi) next.titleVi = String(ai.titleVi);
	if (ai.titleJa) next.titleJa = String(ai.titleJa);
	if (ai.settingVi) next.settingVi = String(ai.settingVi);
	if (ai.settingJa) next.settingJa = String(ai.settingJa);
	if (ai.situationVi) next.situationVi = String(ai.situationVi);
	if (ai.situationJa) next.situationJa = String(ai.situationJa);
	if (ai.objectivesVi) next.objectivesVi = String(ai.objectivesVi);
	if (ai.objectivesJa) next.objectivesJa = String(ai.objectivesJa);
	if (ai.culturalNotesVi) next.culturalNotesVi = String(ai.culturalNotesVi);
	if (ai.culturalNotesJa) next.culturalNotesJa = String(ai.culturalNotesJa);
	if (Array.isArray(ai.roles) && ai.roles.length > 0) {
		next.roles = ai.roles.map((r) => ({
			nameVi: r.nameVi ?? '',
			nameJa: r.nameJa ?? '',
			descriptionVi: r.descriptionVi ?? '',
			descriptionJa: r.descriptionJa ?? '',
		}));
	}
	if (Array.isArray(ai.keyPhrases) && ai.keyPhrases.length > 0) {
		next.keyPhrases = ai.keyPhrases.map((p) => ({
			phraseJa: p.phraseJa ?? '',
			reading: p.reading ?? '',
			meaningVi: p.meaningVi ?? '',
		}));
	}
	return next;
}

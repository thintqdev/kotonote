/**
 * Câu mở đầu hội thoại khi AI không khả dụng — theo category / vai trò đối tác.
 */

/** @typedef {{ partnerMessageJa: string, partnerMessageVi: string, suggestion: { replyJa: string, replyReading: string, replyVi: string } }} KaiwaOpeningTemplate */

/** @type {Record<string, KaiwaOpeningTemplate>} */
const CATEGORY_OPENINGS = {
	restaurant: {
		partnerMessageJa: 'いらっしゃいませ。ご注文はお決まりですか。',
		partnerMessageVi: 'Xin chào. Bạn đã chọn món chưa?',
		suggestion: {
			replyJa: 'すみません、メニューをください。',
			replyReading: 'すみません、メニューをください。',
			replyVi: 'Cho tôi xem menu được không?',
		},
	},
	travel: {
		partnerMessageJa: 'すみません、お困りのようですね。どうしましたか。',
		partnerMessageVi: 'Xin lỗi, có vẻ bạn đang gặp khó khăn. Có chuyện gì không?',
		suggestion: {
			replyJa: 'すみません、駅はどこですか。',
			replyReading: 'すみません、えきはどこですか。',
			replyVi: 'Xin lỗi, nhà ga ở đâu ạ?',
		},
	},
	shopping: {
		partnerMessageJa: 'いらっしゃいませ。何かお探しですか。',
		partnerMessageVi: 'Xin chào. Bạn đang tìm gì ạ?',
		suggestion: {
			replyJa: 'すみません、これはいくらですか。',
			replyReading: 'すみません、これはいくらですか。',
			replyVi: 'Xin lỗi, cái này bao nhiêu tiền?',
		},
	},
	business: {
		partnerMessageJa: 'お疲れ様です。本日はよろしくお願いします。',
		partnerMessageVi: 'Chào anh/chị. Hôm nay rất mong được hợp tác.',
		suggestion: {
			replyJa: 'お疲れ様です。こちらこそ、よろしくお願いします。',
			replyReading: 'おつかれさまでス。こちらこそ、よろしくおねがいします。',
			replyVi: 'Chào anh/chị. Tôi cũng rất mong được hợp tác.',
		},
	},
	work: {
		partnerMessageJa: 'おはようございます。今日もよろしくお願いします。',
		partnerMessageVi: 'Chào buổi sáng. Hôm nay cũng nhờ anh/chị giúp đỡ.',
		suggestion: {
			replyJa: 'おはようございます。よろしくお願いします。',
			replyReading: 'おはようございます。よろしくおねがいします。',
			replyVi: 'Chào buổi sáng. Rất mong được giúp đỡ.',
		},
	},
	school: {
		partnerMessageJa: 'おはようございます。今日も頑張りましょう。',
		partnerMessageVi: 'Chào buổi sáng. Hôm nay cùng cố gắng nhé.',
		suggestion: {
			replyJa: 'おはようございます。今日もよろしくお願いします。',
			replyReading: 'おはようございます。きょうもよろしくおねがいします。',
			replyVi: 'Chào buổi sáng. Hôm nay cũng nhờ bạn giúp đỡ.',
		},
	},
	hospital: {
		partnerMessageJa: 'お待ちください。どこがお悪いですか。',
		partnerMessageVi: 'Xin chờ một chút. Bạn bị đau ở đâu?',
		suggestion: {
			replyJa: 'すみません、頭が痛いです。',
			replyReading: 'すみません、あたまがいたいです。',
			replyVi: 'Xin lỗi, tôi bị đau đầu.',
		},
	},
	daily: {
		partnerMessageJa: 'こんにちは。今日はどうされましたか。',
		partnerMessageVi: 'Xin chào. Hôm nay bạn cần gì ạ?',
		suggestion: {
			replyJa: 'すみません、ちょっとお聞きしたいことがあります。',
			replyReading: 'すみません、ちょっとおききしたいことがあります。',
			replyVi: 'Xin lỗi, tôi muốn hỏi một chút.',
		},
	},
	other: {
		partnerMessageJa: 'こんにちは。何かお手伝いしましょうか。',
		partnerMessageVi: 'Xin chào. Tôi có thể giúp gì cho bạn?',
		suggestion: {
			replyJa: 'すみません、よろしくお願いします。',
			replyReading: 'すみません、よろしくおねがいします。',
			replyVi: 'Xin lỗi, nhờ bạn giúp đỡ.',
		},
	},
};

/**
 * @param {{ nameJa?: string, nameVi?: string, descriptionJa?: string, descriptionVi?: string } | undefined} role
 */
function inferCategoryFromPartnerRole(role) {
	const text = [
		role?.nameJa,
		role?.nameVi,
		role?.descriptionJa,
		role?.descriptionVi,
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

	if (/店員|ウェイター|スタッフ|nhân viên|phục vụ/.test(text)) return 'restaurant';
	if (/通行人|観光|旅行者|du khách|địa phương|hỏi đường/.test(text)) return 'travel';
	if (/医者|看護|病院|bác sĩ|y tá|bệnh viện/.test(text)) return 'hospital';
	if (/同僚|上司|取引|business|kinh doanh|đối tác/.test(text)) return 'business';
	if (/先生|教師|学校|giáo viên|trường/.test(text)) return 'school';
	if (/店|販売|shopping|mua sắm/.test(text)) return 'shopping';
	if (/会社|職場|colleague|đồng nghiệp/.test(text)) return 'work';
	return null;
}

/**
 * @param {Record<string, unknown>} ctx
 * @param {number} partnerRoleIndex
 */
function resolveOpeningCategory(ctx, partnerRoleIndex) {
	const category = String(ctx.category ?? 'daily').trim().toLowerCase();
	if (category && category !== 'daily' && CATEGORY_OPENINGS[category]) {
		return category;
	}
	const roles = Array.isArray(ctx.roles) ? ctx.roles : [];
	const partnerRole = roles[partnerRoleIndex];
	const inferred = inferCategoryFromPartnerRole(partnerRole);
	return inferred ?? category ?? 'daily';
}

/**
 * @param {Record<string, unknown>} ctx
 * @param {KaiwaOpeningTemplate} template
 */
function buildOpeningSuggestion(ctx, template) {
	const phrases = Array.isArray(ctx.keyPhrases) ? ctx.keyPhrases : [];
	const first = phrases.find((p) => String(p?.phraseJa ?? '').trim());
	if (!first) return template.suggestion;

	const phraseJa = String(first.phraseJa).trim();
	const meaningVi = String(first.meaningVi ?? '').trim();

	if (/ください/.test(phraseJa)) {
		const item = phraseJa.replace(/[〜～]/g, 'コーヒー');
		return {
			replyJa: `すみません、${item}。`,
			replyReading: `すみません、${item.replace(/[^\u3040-\u309F\u30A0-\u30FF]/g, '') || 'コーヒーをください'}`,
			replyVi: meaningVi ? `Xin lỗi, ${meaningVi}` : template.suggestion.replyVi,
		};
	}

	if (/どこ/.test(phraseJa)) {
		const topic = phraseJa.replace(/[〜～は]/g, '駅');
		return {
			replyJa: `すみません、${topic}？`,
			replyReading: 'すみません、えきはどこですか。',
			replyVi: meaningVi ? `Xin lỗi, ${meaningVi}` : template.suggestion.replyVi,
		};
	}

	if (/すみません|こんにちは|おはよう|いらっしゃいませ/.test(phraseJa)) {
		return {
			replyJa: phraseJa,
			replyReading: String(first.reading ?? phraseJa).trim() || phraseJa,
			replyVi: meaningVi || template.suggestion.replyVi,
		};
	}

	return template.suggestion;
}

/**
 * @param {Record<string, unknown>} ctx
 * @param {number} partnerRoleIndex
 */
export function buildKaiwaOpeningPlaceholderTurn(ctx, partnerRoleIndex = 1) {
	const roles = Array.isArray(ctx.roles) ? ctx.roles : [];
	const partnerRole = roles[partnerRoleIndex] ?? roles[1] ?? roles[0] ?? {};
	const categoryKey = resolveOpeningCategory(ctx, partnerRoleIndex);
	const template =
		CATEGORY_OPENINGS[categoryKey] ?? CATEGORY_OPENINGS.daily;
	const partnerName = String(partnerRole.nameVi ?? partnerRole.nameJa ?? 'Đối tác').trim();
	const situationVi = String(ctx.situationVi ?? ctx.titleVi ?? '').trim();

	return {
		partnerMessageJa: template.partnerMessageJa,
		partnerMessageVi: template.partnerMessageVi,
		analysis: {
			summaryVi: situationVi
				? `Bắt đầu tình huống «${String(ctx.titleVi ?? '').trim() || 'hội thoại'}»: ${situationVi.slice(0, 160)}${situationVi.length > 160 ? '…' : ''}`
				: `Bắt đầu hội thoại — bạn đóng vai học viên, ${partnerName} (AI) mở lời trước.`,
			grammarNoteVi: '',
			politenessVi: 'Giữ giọng lịch sự (です・ます) phù hợp tình huống.',
			naturalnessVi: '',
		},
		suggestion: buildOpeningSuggestion(ctx, template),
		conversationEnded: false,
	};
}

import { MAX_KANJI_PER_DECK } from "./kanjiFieldMeta.js";
import {
	generateAdminKanji,
	generateAdminVocabulary,
} from "../services/adminAIService.js";
import { importKanjiFromJson } from "../services/adminKanjiService.js";
import { importVocabularyFromJson } from "../services/adminVocabularyService.js";

export const VOCABULARY_AI_GENERATE = {
	promptType: "vocabulary",
	modalTitle: "Generate từ vựng (AI)",
	unitLabel: "từ",
	maxPerDeck: 25,
	defaultTemplate: (level) => {
		const lv = String(level ?? "n5").toLowerCase();
		if (lv === "n3") return "n3-daily";
		if (lv === "n4") return "n5-basic";
		if (lv === "n2" || lv === "n1") return "n3-daily";
		return "n5-basic";
	},
	generate: async (payload) => {
		const result = await generateAdminVocabulary(payload);
		return {
			items: result.vocabulary ?? [],
			deck: result.deck ?? null,
			source: result.source ?? "",
		};
	},
	importToDeck: importVocabularyFromJson,
	previewColumns: [
		{ key: "word", label: "Từ", lang: "ja" },
		{ key: "reading", label: "Đọc", lang: "ja" },
		{ key: "meaning", label: "Nghĩa" },
	],
};

export const KANJI_AI_GENERATE = {
	promptType: "kanji",
	modalTitle: "Generate Kanji (AI)",
	unitLabel: "chữ",
	maxPerDeck: MAX_KANJI_PER_DECK,
	defaultTemplate: (jlpt) => {
		const lv = String(jlpt ?? "N5").toUpperCase();
		if (lv === "N3") return "n3-intermediate";
		if (lv === "N4" || lv === "N2" || lv === "N1") return "n5-basic";
		return "n5-basic";
	},
	generate: async (payload) => {
		const result = await generateAdminKanji(payload);
		return {
			items: result.kanji ?? [],
			deck: result.deck ?? null,
			source: result.source ?? "",
		};
	},
	importToDeck: importKanjiFromJson,
	previewColumns: [
		{ key: "char", label: "Chữ", lang: "ja" },
		{ key: "onYomi", label: "On", lang: "ja" },
		{ key: "meaningVi", label: "Nghĩa" },
	],
};

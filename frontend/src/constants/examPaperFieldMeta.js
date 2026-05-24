export const EXAM_JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];

export const EXAM_SESSION_OPTIONS = [
	{ value: 'july', label: 'Tháng 7' },
	{ value: 'december', label: 'Tháng 12' },
];

export const EXAM_SOURCE_OPTIONS = [
	{ value: 'past_exam', label: 'Đề các kỳ thi trước' },
	{ value: 'official', label: 'Đề chính thức' },
	{ value: 'mock', label: 'Đề mô phỏng' },
];

export function examSessionLabel(session) {
	return EXAM_SESSION_OPTIONS.find((o) => o.value === session)?.label ?? session;
}

export function examSourceLabel(sourceType) {
	return EXAM_SOURCE_OPTIONS.find((o) => o.value === sourceType)?.label ?? sourceType;
}

const CURRENT_YEAR = new Date().getFullYear();

/** @returns {number[]} */
export function examYearOptions(start = 2010, end = CURRENT_YEAR + 1) {
	const years = [];
	for (let y = end; y >= start; y -= 1) {
		years.push(y);
	}
	return years;
}

/** Câu hỏi mặc định cho phần nghe (JLPT thường không ghi lại đề bài từng câu). */
export const EXAM_LISTENING_DEFAULT_QUESTION_JA = '正しい答えはどれですか。';

export const EXAM_QUESTION_TYPE_OPTIONS = [
	{ value: 'multiple_choice', label: 'Trắc nghiệm' },
	{ value: 'star_question', label: '★問題 (____ + ★)' },
	{ value: 'fill_blank', label: 'Điền chỗ trống' },
	{ value: 'ordering', label: 'Sắp xếp' },
	{ value: 'short_answer', label: 'Trả lời ngắn' },
];

export const EXAM_DEFAULT_DURATION = {
	N1: 170,
	N2: 155,
	N3: 140,
	N4: 125,
	N5: 105,
};

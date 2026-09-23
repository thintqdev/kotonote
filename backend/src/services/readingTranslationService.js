import { isGeminiConfigured } from '../config/gemini.js';
import { callGeminiAPI } from './aiService.js';

const clean = (value, max = 12000) => String(value ?? '').trim().slice(0, max);
const list = (value, max = 8) => (Array.isArray(value) ? value.slice(0, max).map((item) => clean(item, 700)).filter(Boolean) : []);

function normalizeFeedback(raw, translationVi) {
	if (!raw || typeof raw !== 'object') return null;
	return {
		overallScore: Math.max(0, Math.min(100, Number(raw.overallScore) || 0)), translationVi,
		summaryVi: clean(raw.summaryVi, 1500), referenceTranslationVi: clean(raw.referenceTranslationVi),
		strengthsVi: list(raw.strengthsVi), focusVi: list(raw.focusVi),
		issues: (Array.isArray(raw.issues) ? raw.issues : []).slice(0, 12).map((issue) => ({
			quote: clean(issue?.quote, 300), correctionVi: clean(issue?.correctionVi, 800),
			explanationVi: clean(issue?.explanationVi, 1000),
			severity: ['minor', 'important', 'critical'].includes(issue?.severity) ? issue.severity : 'important',
		})),
		keyStructures: (Array.isArray(raw.keyStructures) ? raw.keyStructures : []).slice(0, 10).map((item) => ({
			pattern: clean(item?.pattern, 250), meaningVi: clean(item?.meaningVi, 600), noteVi: clean(item?.noteVi, 800),
		})),
		readingMethodVi: list(raw.readingMethodVi),
	};
}

function buildPrompt({ titleJa, jlpt, articleJa, translationVi }) {
	return `Bạn là giáo viên đọc hiểu tiếng Nhật chuyên sâu cho người Việt ở trình độ ${jlpt}.
Học viên đã dịch NGUYÊN BÀI, không chấm tách theo câu hay đoạn. Đánh giá bản dịch như một chỉnh thể theo ngữ cảnh toàn bài "${titleJa}".

Tiêu chí: độ chính xác nội dung (chủ thể bị lược, phủ định, thời/thể, điều kiện, quan hệ logic), sắc thái, độ đầy đủ và tiếng Việt tự nhiên. overallScore bắt buộc dùng thang 0–100 (bản dịch gần như đúng phải khoảng 85–100), tuyệt đối không dùng thang 10. Không phạt cách diễn đạt khác bản tham khảo nếu nghĩa đúng. Chỉ trích nguyên văn cụm ngắn từ bản dịch học viên trong quote để giao diện tô đậm. Không chia feedback theo câu/đoạn. Bản tham khảo phải đầy đủ, trung thành, mạch lạc và giữ ranh giới đoạn bằng xuống dòng. readingMethodVi phải là các bước cụ thể để đọc lại chính bài này. Không trả HTML hoặc Markdown.

BÀI TIẾNG NHẬT:\n${articleJa}\n\nBẢN DỊCH NGUYÊN BÀI CỦA HỌC VIÊN:\n${translationVi}

Trả về đúng một JSON object:
{"overallScore":number,"summaryVi":string,"referenceTranslationVi":string,"strengthsVi":string[],"focusVi":string[],"issues":[{"quote":string,"correctionVi":string,"explanationVi":string,"severity":"minor|important|critical"}],"keyStructures":[{"pattern":string,"meaningVi":string,"noteVi":string}],"readingMethodVi":string[]}`;
}

function fallback(translationVi) {
	return {
		overallScore: 0, translationVi,
		summaryVi: 'AI chưa kết nối được. Bản dịch nguyên bài của bạn vẫn được giữ trên trang để thử lại.',
		referenceTranslationVi: '', strengthsVi: ['Bạn đã hoàn thành bản dịch toàn bài trước khi xem đáp án.'],
		focusVi: ['Đọc lại mạch lập luận toàn bài, đặc biệt là từ nối, phủ định và kết luận của tác giả.'],
		issues: [], keyStructures: [],
		readingMethodVi: ['Đọc câu hỏi trước để xác định thông tin cần tìm.', 'Gạch chân từ nối, phủ định và động từ chính của mỗi mệnh đề.', 'Tóm tắt vai trò của từng đoạn rồi nối thành mạch lập luận chung.', 'Dịch toàn bài một lượt, sau đó kiểm tra ý bị thiếu hoặc tự thêm.'],
	};
}

export async function analyzeReadingTranslation({ article, translationVi }) {
	const cleaned = clean(translationVi);
	if (!isGeminiConfigured()) return { feedback: fallback(cleaned), source: 'placeholder' };
	const raw = await callGeminiAPI(buildPrompt({ titleJa: article.titleJa, jlpt: article.jlpt, articleJa: (article.paragraphsJa ?? []).join('\n\n'), translationVi: cleaned }), { temperature: 0.25, maxTokens: 8192, arrayMode: false });
	const feedback = normalizeFeedback(raw, cleaned);
	return feedback ? { feedback, source: 'gemini' } : { feedback: fallback(cleaned), source: 'placeholder' };
}

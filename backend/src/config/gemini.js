/** Model Gemini — cấu hình qua GEMINI_MODEL trong .env */
export const GEMINI_MODEL =
	process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

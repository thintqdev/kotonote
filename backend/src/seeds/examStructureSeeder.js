import { ensureDefaultTemplatesSeeded } from '../services/examStructureService.js';

/**
 * Seed khung cấu trúc JLPT N5–N1 vào DB (idempotent theo code).
 */
export default async function seedExamStructures() {
	console.log('📋 Seeding exam structure templates...');
	const items = await ensureDefaultTemplatesSeeded();
	console.log(`   ✓ ${items.length} exam structure template(s) ready`);
}

import ListeningExercise from '../models/ListeningExercise.js';
import { LISTENING_DEMO_EXERCISES } from './listeningDemoSeedData.js';

/**
 * Nạp bài nghe demo (bỏ qua titleVi đã tồn tại).
 * Dùng cùng payload như adminListeningController.create → listeningExerciseService.create.
 */
export default async function seedListeningDemo() {
	let created = 0;
	let skipped = 0;

	for (const row of LISTENING_DEMO_EXERCISES) {
		const exists = await ListeningExercise.findOne({ titleVi: row.titleVi }).lean();
		if (exists) {
			skipped += 1;
			continue;
		}
		await ListeningExercise.create(row);
		created += 1;
	}

	console.log(`   Listening: ${created} created, ${skipped} skipped`);
	if (created === 0 && skipped > 0) {
		console.log(
			'   → Dữ liệu demo đã có trong DB (không tạo trùng theo titleVi). Muốn seed lại: xóa collection listeningexercises hoặc xóa 4 bài demo rồi chạy lại.',
		);
	}
	return { created, skipped };
}

import ListeningExercise from '../models/ListeningExercise.js';
import ListeningExerciseProgress from '../models/ListeningExerciseProgress.js';
import AppError from '../utils/AppError.js';
import { LISTENING } from '../constants/messages.js';

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} exerciseId
 * @param {{ status?: string, recordAnswer?: { questionIndex: number, choiceIndex: number } }} body
 */
export async function saveListeningProgress(userId, exerciseId, body = {}) {
	const exercise = await ListeningExercise.findById(exerciseId).lean();
	if (!exercise || !exercise.isPublished) {
		throw new AppError(LISTENING.NOT_FOUND, 404);
	}

	const prior = await ListeningExerciseProgress.findOne({
		userId,
		exerciseId,
	}).lean();

	const patch = {};
	if (body.status) {
		patch.status = body.status;
	}
	if (Array.isArray(body.questionAnswers)) {
		patch.questionAnswers = body.questionAnswers;
	}
	if (body.recordAnswer) {
		const { questionIndex, choiceIndex } = body.recordAnswer;
		const answers = [...(prior?.questionAnswers ?? [])];
		const idx = answers.findIndex((a) => a.questionIndex === questionIndex);
		const entry = { questionIndex, choiceIndex };
		if (idx >= 0) answers[idx] = entry;
		else answers.push(entry);
		patch.questionAnswers = answers;

		const totalQ = exercise.questions?.length ?? 0;
		if (totalQ > 0) {
			const allAnswered = Array.from({ length: totalQ }, (_, i) =>
				answers.some((a) => a.questionIndex === i),
			).every(Boolean);
			if (allAnswered) {
				patch.status = 'done';
			} else if (!patch.status) {
				patch.status = 'in_progress';
			}
		} else if (!patch.status) {
			patch.status = 'in_progress';
		}
	}

	if (!patch.status && !patch.questionAnswers) {
		patch.status = 'in_progress';
	}

	const now = new Date();
	const update = {
		...patch,
		lastActivityAt: now,
	};
	if (patch.status === 'done') {
		update.completedAt = now;
	}

	return ListeningExerciseProgress.findOneAndUpdate(
		{ userId, exerciseId },
		{ $set: update, $setOnInsert: { userId, exerciseId } },
		{ new: true, upsert: true, runValidators: true },
	).lean();
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function listInProgressListening(userId) {
	return ListeningExerciseProgress.find({
		userId,
		status: 'in_progress',
	})
		.sort({ lastActivityAt: -1 })
		.limit(5)
		.lean();
}

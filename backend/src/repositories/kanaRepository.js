import Kana from '../models/Kana.js';

export const findAllKana = async (filters = {}) => {
	return await Kana.find(filters).sort({ displayOrder: 1, createdAt: 1 });
};

export const findKanaByScript = async (script, type = null) => {
	const query = { script, isActive: true };
	if (type) query.type = type;
	return await Kana.find(query).sort({ displayOrder: 1 });
};

export const findKanaByChar = async (char) => {
	return await Kana.findOne({ char });
};

export const findKanaById = async (kanaId) => {
	return await Kana.findById(kanaId);
};

export const createKana = async (kanaData) => {
	const kana = new Kana(kanaData);
	return await kana.save();
};

export const updateKana = async (kanaId, updateData) => {
	return await Kana.findByIdAndUpdate(kanaId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deleteKana = async (kanaId) => {
	return await Kana.findByIdAndDelete(kanaId);
};

export const getKanaByRow = async (script, rowKey) => {
	return await Kana.find({ script, rowKey, isActive: true }).sort({
		columnIndex: 1,
	});
};

export const bulkCreateKana = async (kanaArray) => {
	return await Kana.insertMany(kanaArray, { ordered: false });
};

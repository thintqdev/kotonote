import mongoose from 'mongoose';

const siteViewDailySchema = new mongoose.Schema(
	{
		dateKey: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: /^\d{4}-\d{2}-\d{2}$/,
		},
		views: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true },
);

siteViewDailySchema.index({ dateKey: 1 });

const SiteViewDaily = mongoose.model('SiteViewDaily', siteViewDailySchema);

export default SiteViewDaily;

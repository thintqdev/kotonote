import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_STATUS, USER_ROLE, AUTH_PROVIDER, LOGIN_ATTEMPT } from '../constants/userStatus.js';

const userEarnedBadgeSchema = new mongoose.Schema(
	{
		badgeKey: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		unlockedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false }
);

const userProfileSchema = new mongoose.Schema(
	{
		readingName: { type: String, default: '', trim: true, maxlength: 80 },
		title: { type: String, default: '', trim: true, maxlength: 120 },
		location: { type: String, default: '', trim: true, maxlength: 120 },
		timeZoneLabel: { type: String, default: '', trim: true, maxlength: 80 },
		bio: { type: String, default: '', maxlength: 2000 },
		examTypeKey: { type: String, default: 'jlpt', trim: true, maxlength: 40 },
		examLevelKey: { type: String, default: '', trim: true, maxlength: 40 },
		examDateIso: { type: String, default: '', trim: true, maxlength: 32 },
		examOtherNote: { type: String, default: '', trim: true, maxlength: 500 },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: function () {
				return !this.googleId;
			},
			minlength: 6,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		avatar: {
			type: String,
		},
		profile: {
			type: userProfileSchema,
			default: () => ({}),
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		authProvider: {
			type: String,
			enum: Object.values(AUTH_PROVIDER),
			default: AUTH_PROVIDER.LOCAL,
		},
		role: {
			type: String,
			enum: Object.values(USER_ROLE),
			default: USER_ROLE.USER,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		status: {
			type: String,
			enum: Object.values(USER_STATUS),
			default: USER_STATUS.ACTIVE,
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockUntil: {
			type: Date,
		},
		lastLogin: {
			type: Date,
		},
		/** Huy hiệu đã mở khóa — `badgeKey` khớp `Badge.key` */
		earnedBadges: {
			type: [userEarnedBadgeSchema],
			default: [],
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpires: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.virtual('isLocked').get(function () {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return await this.updateOne({
			$set: { loginAttempts: 1 },
			$unset: { lockUntil: 1 },
		});
	}
	
	const updates = { $inc: { loginAttempts: 1 } };
	
	if (this.loginAttempts + 1 >= LOGIN_ATTEMPT.MAX_ATTEMPTS && !this.isLocked) {
		updates.$set = { 
			lockUntil: Date.now() + LOGIN_ATTEMPT.LOCK_TIME,
			status: USER_STATUS.LOCKED
		};
	}
	
	return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
	return await this.updateOne({
		$set: { 
			loginAttempts: 0,
			lastLogin: Date.now(),
			status: USER_STATUS.ACTIVE
		},
		$unset: { lockUntil: 1 },
	});
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	delete obj.loginAttempts;
	delete obj.lockUntil;
	delete obj.emailVerificationToken;
	delete obj.emailVerificationExpires;
	return obj;
};

export default mongoose.model('User', userSchema);

import express from 'express';
import {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { validateUser } from '../validators/userValidator.js';

const router = express.Router();

router.route('/')
	.get(protect, restrictTo('admin'), getUsers)
	.post(validateUser, createUser);

router.route('/:id')
	.get(protect, getUser)
	.put(protect, validateUser, updateUser)
	.delete(protect, restrictTo('admin'), deleteUser);

export default router;

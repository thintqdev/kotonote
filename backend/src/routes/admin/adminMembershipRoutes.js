import express from 'express';
import * as adminMembershipController from '../../controllers/admin/adminMembershipController.js';
import { validate } from '../../middlewares/validate.js';
import { updateUserMembershipSchema } from '../../validators/adminMembershipValidator.js';

const router = express.Router();

router.get('/statistics', adminMembershipController.getStatistics);
router.get('/users', adminMembershipController.listUsers);
router.get('/checkouts', adminMembershipController.listCheckouts);
router.patch(
	'/users/:userId',
	validate(updateUserMembershipSchema),
	adminMembershipController.updateUserMembership,
);

export default router;

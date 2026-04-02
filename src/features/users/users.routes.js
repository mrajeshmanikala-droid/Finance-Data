import { Router } from 'express';
import usersController from './users.controller.js';
import authenticate from '../../middlewares/auth.js';
import authorize from '../../middlewares/rbac.js';
import validate from '../../middlewares/validate.js';
import {
  updateUserSchema,
  updateProfileSchema,
  getUserSchema,
  listUsersSchema,
} from './users.validator.js';

const router = Router();

router.use(authenticate);



router.get('/me', usersController.getProfile);


router.patch('/me', validate(updateProfileSchema), usersController.updateProfile);


router.get('/', authorize('ADMIN'), usersController.listUsers);


router.get('/:id', authorize('ADMIN'), validate(getUserSchema), usersController.getUser);


router.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), usersController.updateUser);


router.delete('/:id', authorize('ADMIN'), validate(getUserSchema), usersController.deleteUser);

export default router;

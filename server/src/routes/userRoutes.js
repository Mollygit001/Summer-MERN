import express from 'express';
import userController  from '../controller/UserController.js';
import authMiddleware  from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorizeMiddleware.js';

const router = express.Router();

router.use(authMiddleware.protect);


router.post('/',authorize('user:create'), userController.create)
router.get('/',authorize('user:read'), userController.getAll)
router.put('/:userId',authorize('user:update'), userController.update);
router.delete('/:userId',authorize('user:delete'), userController.deleteUser);

export default router;


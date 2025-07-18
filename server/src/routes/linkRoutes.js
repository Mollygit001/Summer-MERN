import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import linksController from '../controller/linksController.js';
import authorize from '../middleware/authorizeMiddleware.js';

const router = express.Router();

router.get('/r/:id', linksController.redirect);

router.use(authMiddleware.protect);
router.get('/analytics', authorize('link:read'), linksController.analytics)
router.post('/',authorize('link:create'), linksController.create);
router.get('/',authorize('link:read'), linksController.getAll);
router.get('/:id',authorize('link:read'), linksController.getById);
router.put('/:id',authorize('link:update'), linksController.update);
router.delete('/:id',authorize('link:delete'), linksController.delete);

export default router;
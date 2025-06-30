import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import linksController from '../controller/linksController.js';

const router = express.Router();

router.get('/r/:id', linksController.redirect);

router.use(authMiddleware.protect);
router.post('/', linksController.create);
router.get('/', linksController.getAll);
router.get('/:id', linksController.getById);
router.put('/:id', linksController.update);
router.delete('/:id', linksController.delete);

export default router;
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import linksController from '../controller/linksController.js';

import authorize from '../middleware/authorizeMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/r/:id', linksController.redirect);

router.use(authMiddleware.protect);
router.get('/analytics', authorize('link:read'), linksController.analytics)
router.post('/',
    authorize('link:create'),
    [
        body('originalUrl').isURL().withMessage('Valid URL is required'),
        body('campaignTitle').notEmpty().withMessage('Campaign title is required'),
        body('category').notEmpty().withMessage('Category is required'),
    ],
    linksController.create
);
router.get('/', authorize('link:read'), linksController.getAll);
router.get('/:id', authorize('link:read'), linksController.getById);
router.put('/:id',
    authorize('link:update'),
    [
        body('originalUrl').optional().isURL().withMessage('Valid URL is required'),
        body('campaignTitle').optional().notEmpty().withMessage('Campaign title is required'),
    ],
    linksController.update
);
router.delete('/:id', authorize('link:delete'), linksController.delete);
router.post('/upload-signature', authorize('link:create'), linksController.createUploadSignature);


export default router;
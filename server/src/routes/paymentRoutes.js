import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import paymentController from '../controller/paymentController.js';
import authorize from '../middleware/authorizeMiddleware.js';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }),
    paymentController.handleWebhookEvent);

router.use(authMiddleware.protect);

router.post('/create-order', authorize('payment:create'), paymentController.createOrder);
router.post('/verify-order', authorize('payment:create'), paymentController.verifyOrder);
router.post('/create-subscription', authorize('payment:create'), paymentController.creatSubscription);
router.post('/verify-subscription', authorize('payment:create'), paymentController.verifySubscription);
router.post('/cancel-subscription', authorize('payment:create'), paymentController.cancelSubscription);

export default router;
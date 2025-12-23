import { PLANS_ID, CREDITS_PACK } from "../constants/payments.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../model/Users.js";
import logger from "../utilities/logger.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentController = {
    createOrder: async (req, res) => {
        try {
            const { credits } = req.body;
            if (!CREDITS_PACK[credits]) {
                return res.status(400).json({ error: "Invalid credits amount" });
            }
            const amount = CREDITS_PACK[credits] * 100; // Convert to paise
            const order = await razorpay.orders.create({
                amount: amount,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                notes: {
                    credits: credits,
                    email: req.user.email,
                    userId: req.user.id,
                },
            });
            res.status(200).json({
                order: order
            })
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({ error: "Failed to create order" });
        }
    },
    verifyOrder: async (request, response) => {
        try {
            const {
                razorpay_order_id, razorpay_payment_id,
                razorpay_signature, credits
            } = request.body;

            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return response.status(400).json({
                    message: 'Signature verification failed'
                });
            }

            const user = await User.findById({ _id: request.user.id });
            user.credits += Number(credits);
            await user.save();
            response.json({ userDetails: user });
        } catch (error) {
            logger.error('Error verifying order:', error);
            response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    createSubscription: async (req, res) => {
        try {
            const { plan_name } = req.body;
            if (!PLANS_ID[plan_name]) {
                return res.status(400).json({ error: "Invalid plan name" });
            }
            const plan = PLANS_ID[plan_name];
            const subscription = await razorpay.subscriptions.create({
                plan_id: plan.id,
                customer_notify: 1,
                total_count: plan.totalBillingCycles,
                notes: {
                    planName: plan.planName,
                    email: req.user.email,
                    userId: req.user.id,
                },
            })
            res.status(200).json({ subscription });
        } catch (error) {
            logger.error("Error creating subscription:", error);
            res.status(500).json({ error: "Failed to create subscription" });
        }
    },

    verifySubscription: async (req, res) => {
        try {
            const { subscription_id } = req.body;
            const subscription = await razorpay.subscriptions.fetch(subscription_id);
            const user = await User.findById(req.user.id);

            user.subscription = {
                id: subscription.id,
                planId: subscription.plan_id,
                status: subscription.status,
                startDate: subscription.current_start ?
                    new Date(subscription.start_at * 1000) :
                    null,
                endDate: subscription.current_end ?
                    new Date(subscription.current_start * 1000 + subscription.current_period_end * 1000)
                    : null,
            };

            await user.save();
            res.status(200).json({
                message: "Payment verified and credits added",
                userDetails: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    subscription: user.subscription,
                }
            });
        } catch (error) {
            logger.error("Error verifying payment:", error);
            res.status(500).json({ error: "Failed to verify payment" });
        }
    },

    handleWebhookEvent: async (req, res) => {
        try {


            const signature = req.headers['x-razorpay-signature'];
            const body = req.body;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');
            if (signature !== expectedSignature) {
                return res.status(400).send({ error: "Invalid signature" });
            }

            const payload = JSON.parse(body.toString());
            logger.info("Parsed payload:", JSON.stringify(payload, 0, 2));

            const event = payload.event;
            const subscriptionData = payload.payload.subscription.entity;
            const razorpaySubscriptionId = subscriptionData.id;
            const userId = subscriptionData.notes?.userId;

            if (!userId) {
                logger.info("User ID not found in subscription notes");
                return res.status(400).send({ error: "User ID not found in subscription notes" });
            }

            let newStatus = '';
            switch (event) {
                case 'subscription.activated':
                    newStatus = 'active';
                    break;
                case 'subscription.cancelled':
                    newStatus = 'cancelled';
                    break;
                case 'subscription.pending':
                    newStatus = 'pending';
                    break;
                case 'subscription.completed':
                    newStatus = 'completed';
                    break;
                default:
                    logger.info("Unhandled event type:", event);
                    return res.status(200).send({ message: "Event type not handled" });
            }

            const user = await User.findOneAndUpdate({ _id: userId },
                {
                    $set: {
                        "subscription.id": razorpaySubscriptionId,
                        "subscription.status": newStatus,
                        "subscription.start": subscriptionData.start_at ?
                            new Date(subscriptionData.start_at * 1000) : null,
                        "subscription.end": subscriptionData.end_at ?
                            new Date(subscriptionData.end_at * 1000) : null,
                        "subscription.lastBillingDate": subscriptionData.current_start ?
                            new Date(subscriptionData.current_start * 1000) : null,
                        "subscription.nextBillingDate": subscriptionData.current_end ?
                            new Date(subscriptionData.current_end * 1000) : null,
                        "subscription.paymentsMade": subscriptionData.paid_count,
                        "subscription.paymentsRemaining": subscriptionData.remaining_count,
                    }

                }, { new: true }
            );

            if (!user) {
                logger.info("User not found with ID:", userId);
                return res.status(404).send({ error: "User not found" });
            }

            logger.info(`Updated user subscription status to ${newStatus} for user ID: ${user.name}`);
            return res.status(200).send({ message: "Webhook event handled successfully", user: user });

        } catch (error) {
            logger.error("Error handling webhook event:", error);
            res.status(500).json({ error: "Failed to handle webhook event" });
        }
    },

    cancelSubscription: async (req, res) => {
        const { subscription_id } = req.body;
        logger.info("Cancelling subscription:", subscription_id);

        try {
            if (!subscription_id) {
                return res.status(400).json({ error: "Subscription ID is required" });
            }

            const subscription = await razorpay.subscriptions.cancel(subscription_id);
            logger.info("Cancelled subscription:", subscription);


            res.status(200).json({ message: "Subscription cancelled successfully", subscription: subscription });
        } catch (error) {
            logger.error("Error cancelling subscription:", error);
            res.status(500).json({ error: "Failed to cancel subscription" });
        }
    }
}

export default paymentController;
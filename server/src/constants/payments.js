const CREDITS_PACK = {
    10: 10,
    20: 20,
    50: 50,
    100: 100
};

const PLANS_ID = {
    UNLIMITED_YEARLY:{
        id: process.env.RAZROPAY_YEARLY_PLAN_ID,
        planName: "Unlimited Yearly",
        totalBillingCycles: 5,
    },
    UNLIMITED_MONTHLY: {
        id: process.env.RAZROPAY_MONTHLY_PLAN_ID,
        planName: "Unlimited Monthly",
        totalBillingCycles: 12,
    }
}

export { CREDITS_PACK, PLANS_ID };
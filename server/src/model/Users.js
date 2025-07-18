import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    id:{
        type: String, // Subscription ID from Razorpay
    },
    status:{
        type: String, // e.g., "active", "cancelled"
        default: "pending",
    },
    start :{
        type : Date,
    },
    end: {
        type: Date,
    },
    lastBillingDate: {
        type: Date,
    },
    nextBillingDate: {
        type: Date,
    },
    paymentsMade:{
        type: Number,
        default: 0, // Number of payments made
    },
    paymentsRemaining: {
        type: Number,
    }
});

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        
    },
    name: {
        type: String,
        required: true,
        
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
        required: false,
    },

    role:{
        type: String,
        default: "admin"
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        index: true,
    },
    credits: {
        type: Number,
        default: 0,
    },
    subscription: {
        type: subscriptionSchema,
        default: () =>({}),
    },
    resetPassCode: {
        type: String,
        default: null
    },
    resetPassCodeExpire:{
        type: Date,
        expires: new Date(Date.now()+ 15 * 60 * 1000) //expire after 15 mins

    }
});

const User = mongoose.model('User', UserSchema);
export default User;
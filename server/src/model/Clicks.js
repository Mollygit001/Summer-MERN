import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
    linkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Links',
        required: true
    },

    ip: String,
    city: String,
    country: String,
    region: String,
    latitude: Number,
    longitude: Number,
    userAgent: String,
    isp: String,
    device: String,
    browser: String,
    referrer: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Clicks = mongoose.model('Clicks', clickSchema);
export default Clicks;
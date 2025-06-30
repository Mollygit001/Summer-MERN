import mongoose  from 'mongoose';

const linkSchema = new mongoose.Schema({
    campaignTitle: { type: String, required: true },
    originalUrl: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: false },

    clickCount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { timestamps: true });

const Links = mongoose.model('links', linkSchema);
export default Links;
import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    addedAt: {
        type: Date,
        default: Date.now
    }

}, { _id: false });

const wishlistSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true   
    },

    items: [wishlistItemSchema]

}, { timestamps: true });

export default mongoose.model("Wishlist", wishlistSchema);
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    discountAmount: {
        type: Number,
        required: true
    },

    minPurchaseAmount: {
        type: Number,
        default: 0
    },

    usageLimit: {
        type: Number,
        default: 1
    },

    usersUsed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    expiryDate: {
        type: Date,
        required: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive","Expired"],
      default: "Active"
    },

}, { timestamps: true });


export default mongoose.model("Coupon", couponSchema);
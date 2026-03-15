import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    discountValue: {
        type: Number,
        required: true
    },

    maxDiscountAmount: {
        type: Number,
        default: 0
    },

    minPurchaseAmount: {
        type: Number,
        default: 0
    },

    usageLimit: {
        type: Number,
        default: 0
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
      enum: ["Active", "Inactive"],
      default: "Active"
    },

}, { timestamps: true });


export default mongoose.model("Coupon", couponSchema);
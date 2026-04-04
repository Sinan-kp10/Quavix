import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    }
});

const walletSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    balance: {
        type: Number,
        default: 0
    },

    transactions: [transactionSchema]

}, { timestamps: true });

export default mongoose.model("Wallet", walletSchema);
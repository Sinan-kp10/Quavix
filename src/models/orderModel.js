import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/orderStatus.js"

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    productName: {
        type: String,
        required: true
    },

    productImage: {
        type: String,
        required: true
    },

    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    attributes: [
        {
            name: String,
            value: String
        }
    ],

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    total: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING
    },

    paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING
    },

    returnVariantId: {
        type: mongoose.Schema.Types.ObjectId
    },

    cancelReason: {
        type: String
    },
    cancelDescription: {
        type: String
    },
    cancelledAt: {
        type: Date
    },

    returnReason: {
        type: String
    },
    returnDescription: {
        type: String
    },
    
    returnRejectReason: {
        type: String
    },

    returnedAt: {
        type: Date
    },
    
    deliveredAt: {
        type: Date
    }

}, { _id: false });



const orderSchema = new mongoose.Schema({


    orderId: {
        type: String,
        unique: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [orderItemSchema],

    shippingAddress: {
        fullname: String,
        phone: String,
        pincode: String,
        street: String,
        city: String,
        state: String,
        addressType: String
    },

    paymentMethod: {
        type: String,
        enum: ["razorpay", "wallet", "cod"],
        required: true
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },



    razorpayOrderId: String,
    razorpayPaymentId: String,

}, { timestamps: true });


orderSchema.pre("save", function () {

    if (!this.orderId) {
        const random = Math.floor(10000 + Math.random() * 90000)
        this.orderId = `ORD-${Date.now().toString().slice(-5)}-${random}`;
    }

});

export default mongoose.model("Order", orderSchema)
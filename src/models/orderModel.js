import mongoose from "mongoose";

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

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },

    orderStatus: {
        type: String,
        enum: [
            "placed",
            "shipped",
            "delivered",
            "cancelled",
            "returned"
        ],
        default: "placed"
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

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

    returnedAt: {
        type: Date
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,

}, { timestamps: true });


orderSchema.pre("save", function () {

    if (!this.orderId) {
        const random = Math.floor(100000 + Math.random() * 900000);
        this.orderId = `ORD-${Date.now()}-${random}`;
    }

});

export default mongoose.model("Order", orderSchema);
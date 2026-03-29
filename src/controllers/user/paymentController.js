
import crypto from "crypto"
import {createRazorpayPayment,} from "../../services/user/paymentServices.js"
import { createOrder } from "../../services/user/userProductService.js"
import productModel from "../../models/productModal.js"
import cartModel from "../../models/cartModel.js"
import userModal from "../../models/userModal.js"
import walletModel from "../../models/walletModel.js"
import couponsModel from "../../models/couponsModel.js"

export const createRazorpay = async (req, res) => {
    try {

        const checkout = req.session.checkoutData;

        if (!checkout) {
            throw new Error("Checkout session expired");
        }

        const { userId, buyNow } = checkout;
        const couponCode = req.session.couponCode;

        let subtotal = 0;
        let couponDiscount = 0;

        if (buyNow) {

            const product = await productModel.findById(buyNow.productId).populate("category");
            if (!product) throw new Error("Product not found");

            const variant = product.variants.id(buyNow.variantId);
            if (!variant) throw new Error("Variant not found");

            const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);
            const discount = (variant.price * offer) / 100;

            const finalPrice = Math.round(variant.price - discount);

            subtotal = finalPrice * buyNow.quantity;

        } else {

            const cart = await cartModel.findOne({ user: userId }).populate({ path: "items.product", populate: { path: "category" } });

            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            for (const item of cart.items) {

                const product = item.product;
                const variant = product.variants.id(item.variant);

                if (!variant) continue;

                const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);
                const discount = (variant.price * offer) / 100;

                const finalPrice = Math.round(variant.price - discount);

                subtotal += finalPrice * item.quantity;
            }
        }

        if (couponCode) {

            const coupon = await couponsModel.findOne({
                code: couponCode,
                status: "Active",
                expiryDate: { $gte: new Date() }
            });

            if (coupon && subtotal >= coupon.minPurchaseAmount) {

                const usedCount = coupon.usersUsed.filter(
                    id => id.toString() === userId.toString()
                ).length;

                if (usedCount >= coupon.usageLimit) {
                    throw new Error("Coupon usage limit reached");
                }

                couponDiscount = coupon.discountAmount;
            }
        }

        const finalTotal = Math.max(0, subtotal - couponDiscount);

        const payment = await createRazorpayPayment(finalTotal);

        res.json({
            success: true,
            ...payment,
            email: req.session.user.email
        });

    } catch (err) {
        console.log(err)
        res.json({
            success: false,
            message: err.message
        });

    }
};

export const verifyRazorpay = async (req, res) => {
    try {

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            throw new Error("Payment verification failed");
        }

        const checkout = req.session.checkoutData;

        if (!checkout) {
            throw new Error("Checkout session expired");
        }

        const order = await createOrder({
            userId: checkout.userId,
            addressId: checkout.addressId,
            paymentMethod: "razorpay",
            buyNowData: checkout.buyNow,
            couponCode: checkout.couponCode || null
        });

        req.session.checkoutData = null;
        req.session.buyNow = null;
        req.session.fromCart = null;
        req.session.couponCode = null;

        res.json({
            success: true,
            orderId: order.orderId
        });

    } catch (err) {

        res.json({
            success: false,
            message: err.message
        });

    }
}

export const loadPaymentFailed = async (req, res) => {
    try {

        const amount = req.query.amount || 0;

        res.render("user/paymentFailed", {
            title: "Payment Failed - Quavix",
            css: "userStyle",
            amount
        });

    } catch (err) {

        console.log(err);
        res.redirect("/not-found");

    }
}

export const loadWallet=async (req,res)=>{

    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5
        const skip = (page - 1) * limit

        const user=await userModal.findById(req.session.user.id)

        if(!user){
            res.redirect('/')
        }

        const wallet=await walletModel.findOne({userId:user.id})

        let transactions = []
        let totalPages = 1

        if (wallet) {
            const allTransactions = wallet.transactions.slice().reverse()

            transactions = allTransactions.slice(skip, skip + limit)

            totalPages = Math.ceil(allTransactions.length / limit)
        }

        res.render("user/wallet", {
            title: "My Wallet - Quavix",
            css: "userStyle",
            user:user,
            wallet:wallet,
            transactions,
            currentPage: page,
            totalPages
        });


        
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
}
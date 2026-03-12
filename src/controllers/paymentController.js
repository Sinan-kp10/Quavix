
import crypto from "crypto"

import {createRazorpayPayment,} from "../services/paymentServices.js"
import { createOrder } from "../services/userProductService.js"
import productModel from "../models/productModal.js";
import cartModel from "../models/cartModel.js";

export const createRazorpay = async (req,res)=>{
    try{

        const checkout = req.session.checkoutData;

        if(!checkout){
            throw new Error("Checkout session expired");
        }

        const { userId, buyNow } = checkout;

        let amount = 0;

        if(buyNow){
            const product = await productModel.findById(buyNow.productId);
            const variant = product.variants.id(buyNow.variantId);

            const offer = product.offerPercentage || 0;
            const discount = (variant.price * offer) / 100;

            const finalPrice = Math.round(variant.price - discount);

            amount = finalPrice * buyNow.quantity;

        }else{

            const cart = await cartModel.findOne({ user: userId }).populate("items.product");

            for(const item of cart.items){

                const product = item.product;
                const variant = product.variants.id(item.variant);

                const offer = product.offerPercentage || 0;
                const discount = (variant.price * offer) / 100;

                const finalPrice = Math.round(variant.price - discount);

                amount += finalPrice * item.quantity;
            }
        }

        const payment = await createRazorpayPayment(amount);

        res.json({
            success:true,
            ...payment,
            email:req.session.user.email
        })

    }catch(err){
        res.json({
            success:false,
            message:err.message
        })
    }
}

export const verifyRazorpay = async (req, res) => {
    try {

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;

        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

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
            buyNowData: checkout.buyNow
        });


        req.session.checkoutData = null;
        req.session.buyNow = null;
        req.session.fromCart = null;

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
};
import { razorpay } from "../../config/razorpay.js";


export const createRazorpayPayment = async(amount)=>{

    const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR"
    })

    return{
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        key: process.env.RAZORPAY_KEY_ID
    }
}



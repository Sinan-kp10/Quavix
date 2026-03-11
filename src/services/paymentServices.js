import { razorpay } from "../config/razorpay.js";
import orderModel from "../models/orderModel.js";


export const createRazorpayPayment=async(orderId)=>{

    const order=await orderModel.findOne({orderId})

    if(!order){
        throw new Error("Order Not Found")
    }

    const razorpayOrder= await razorpay.orders.create({
        amount:order.totalAmount * 100,
        currency: "INR",
        receipt:order.orderId
    })

    order.razorpayOrderId=razorpayOrder.id
    await order.save()

    return{
        razorpayOrderId: order.razorpayOrderId,
        amount:razorpayOrder.amount,
        key: process.env.RAZORPAY_KEY_ID,
        contact: order.shippingAddress.phone
    }
}
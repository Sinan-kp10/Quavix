import userModal from "../models/userModal.js"
import {
    createRazorpayPayment

} from "../services/paymentServices.js"

export const createRazorpay=async(req,res)=>{
    try {

        const {orderId}=req.body

        const payment=await createRazorpayPayment(orderId)

        res.json({
            success:true,
            ...payment,
            email: req.session.user.email

        })
        
    } catch (err) {
        res.json({
            success:false,
            message:err.message
        })
    }
}
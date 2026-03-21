import couponsModel from "../models/couponsModel.js";

export const getAllCoupons=async(search="",status="all",page=1,limit=12)=>{

    let query={}

    if(search){
        query= {code:{$regex:search , $options:"i" }}
        
    }

    if (status === "Active") {
        query.status = "Active"
    }

    else if (status === "Inactive") {
        query.status = "Inactive"
    }

    else if (status === "Expired") {
        query.expiryDate = { $lt: new Date() }
    }

    const skip=(page-1)*limit
    const couponsList=await couponsModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit)

    const totalCoupons=await couponsModel.countDocuments(query)

    return {
        couponsList,totalCoupons
    }
}

export const addCouponService= async(code,discountAmount,minPurchaseAmount,date)=>{

    const existingCoupon = await couponsModel.findOne({ code });

    if (existingCoupon) {
        throw new Error("Coupon code already exists")
    }

    const newCoupon=new couponsModel({
        code:code,
        discountAmount:discountAmount,
        minPurchaseAmount:minPurchaseAmount,
        expiryDate:date

    })

    await newCoupon.save()

    return true

}

export const updateCoupon = async (id, code, discountAmount, minPurchaseAmount,date) => {

    const coupon = await couponsModel.findById(id)

    if(!coupon){
        throw new Error("Coupon not found")
    }

    const existingCoupon = await couponsModel.findOne({code,_id: { $ne: id }})

    if(existingCoupon){
        throw new Error("Coupon code already exists")
    }

    if( coupon.code === code &&coupon.discountAmount == discountAmount &&coupon.minPurchaseAmount == minPurchaseAmount && new Date(coupon.expiryDate).toISOString().split("T")[0] === date ){
        throw new Error("No changes were made")
    }

    await couponsModel.findByIdAndUpdate(id,{
        code,
        discountAmount,
        minPurchaseAmount,
        expiryDate: date
    })

    return true
}

export const deleteCoupon = async (couponId) => {

    const coupon = await couponsModel.findById(couponId);

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    if (coupon.status === "Active") {
        coupon.status = "Inactive";
    } else {
        coupon.status = "Active";
    }

    await coupon.save();
    return coupon;
}
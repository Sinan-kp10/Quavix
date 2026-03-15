import couponsModel from "../models/couponsModel.js";

export const getAllCoupons=async(search="",status="all",page=1,limit=12)=>{

    let query={}

    if(search){
        query= {code:{$regex:search , $options:"i" }}
        
    }

    if(status !== "all"){
        query.status = status;
    }

    const skip=(page-1)*limit
    const couponsList=await couponsModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit)

    const totalCoupons=await couponsModel.countDocuments(query)

    return {
        couponsList,totalCoupons
    }
}

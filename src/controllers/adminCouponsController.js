import couponsModel from "../models/couponsModel.js"
import { getAllCoupons,addCouponService,updateCoupon,deleteCoupon } from "../services/adminCouponsService.js"

export const loadCoupons=async(req,res)=>{
    try {

        const search=req.query.search|| ""
        const status=req.query.status|| "all"
        const page=parseInt(req.query.page) || 1
        const limit = 12

        const {couponsList,totalCoupons}=await getAllCoupons(search,status,page,limit)

        const totalPages= Math.ceil(totalCoupons/limit)

        const editId = req.query.edit || null
        let editCoupon = null
        if (editId) {
            editCoupon = await couponsModel.findById(editId);
        }

        res.render("admin/coupons", {
            title: "Coupons Management - Quavix",
            css: "adminStyle",
            couponsList:couponsList,
            editCoupon,
            search,
            status,
            currentPage:page,
            totalPages,
            noCoupons:couponsList.length===0
        })
        
    } catch (err) {
        console.log(err)
        res.redirect("/admin/dashboard")
    }
}

export const addCoupon=async(req,res)=>{
    try {

        const {code,discountAmount,minPurchaseAmount,date}= req.body

        
        const regex = /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{6,12}$/

        if (!regex.test(code)) {
            throw new Error("Code must be at least 6 characters and contain both letters and numbers (A-Z, 0-9)")
        }
        

        if (!discountAmount || discountAmount <= 0 ||!minPurchaseAmount || minPurchaseAmount <= 0  || !date){
            throw new Error("All fields are required");
        }
        else if(minPurchaseAmount <= discountAmount){
            throw new Error("Discount amount should be lower than min purchase amount");
        }

        const today = new Date();
        const expiry = new Date(date);

        if (expiry < today) {
            throw new Error("Expiry date cannot be in the past");
        }
                
        await addCouponService(code,discountAmount,minPurchaseAmount,date)

        req.session.toastMessage = "Coupon added successfully"
        req.session.toastType = "success"

        res.redirect("/admin/coupons")

        
    } catch (err) {
        console.log(err)
        req.session.toastMessage = err.message || "Something went wrong";
        req.session.toastType = "error";
        res.redirect("/admin/coupons")
    }
}

export const editCoupon=async(req,res)=>{

    try {
        
       
        const {id}=req.params
        const {code,discountAmount,minPurchaseAmount,date}=req.body

                
        const regex = /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{6,12}$/

        if (!regex.test(code)) {
            throw new Error("Code must be at least 6 characters and contain both letters and numbers (A-Z, 0-9)")
        }
        

        if (!discountAmount || discountAmount <= 0 ||!minPurchaseAmount || minPurchaseAmount <= 0|| !date){
            throw new Error("All fields are required");
        }
        else if(minPurchaseAmount <= discountAmount){
            throw new Error("Discount amount should be lower than min purchase amount");
        }

        const today = new Date();
        const expiry = new Date(date);

        if (expiry < today) {
            throw new Error("Expiry date cannot be in the past");
        }
          

        await updateCoupon(id,code,discountAmount,minPurchaseAmount,date)
        req.session.toastMessage = "Coupon updated successfully!";
        req.session.toastType = "success";
        res.redirect("/admin/coupons");
                
           
        
    } catch (err) {
        req.session.toastMessage = err.message || "Updation failed";
        req.session.toastType = "error";

        res.redirect("/admin/coupons");
    }
}

export const removeCoupon = async (req, res) => {
    try {

        const { id } = req.params;

        const updatedCoupon = await deleteCoupon(id);

        if (updatedCoupon.status === "Active") {
            req.session.toastMessage = "Coupon restored successfully!";
        } else {
            req.session.toastMessage = "Coupon deactivated successfully!";
        }

        req.session.toastType = "success";
        res.redirect("/admin/coupons");

    } catch (err) {
        req.session.toastMessage = err.message || "Action failed";
        req.session.toastType = "error";
        res.redirect("/admin/coupons");
    }
};
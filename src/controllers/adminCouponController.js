import { getAllCoupons } from "../services/adminCouponsService.js"

export const loadCoupons=async(req,res)=>{
    try {

        const search=req.query.search|| ""
        const status=req.query.status|| "all"
        const page=parseInt(req.query.page) || 1
        const limit = 12

        const {couponsList,totalCoupons}=await getAllCoupons(search,status,page,limit)

        const totalPages= Math.ceil(totalCoupons/limit)

        res.render("admin/coupons", {
            title: "Coupons Management - Quavix",
            css: "adminStyle",
            users:couponsList,
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
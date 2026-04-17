import express from "express"
import upload from "../config/multer.js"
import multer from "multer";
const router=express.Router()
import {isLogin,checkSession} from "../middleware/admin/adminAuth.js"
import { loadCoupons,addCoupon,editCoupon,removeCoupon} from "../controllers/admin/adminCouponsController.js"
import {
    loadOrders,
    editOrderStatus,
    OrderDetails,
    handleReturnRequest
 } from "../controllers/admin/adminOrderController.js"

import {
    loadLogin,
    loadDashboard,
    adminLogin,
    loadAllUsers,
    blockedUsers,
    activeUsers,
    adminLogout,
    loadCategory,
    addCategory,
    removeCategory,
    editCategory,
    loadReports,
    exportExcel,
    exportPDF
    
} from "../controllers/admin/adminController.js"

import { 
    loadProducts,
    loadAddProducts,
    addProduct,
    loadEditProduct,
    editProduct,
    removeProduct
} from "../controllers/admin/adminProductController.js"



router.get("/admin/login", checkSession, loadLogin)
router.post("/admin/login", adminLogin)
router.get("/admin/dashboard", isLogin, loadDashboard)

router.get("/admin/reports",isLogin,loadReports)
router.get("/admin/reports/excel", isLogin, exportExcel)
router.get("/admin/reports/pdf", isLogin, exportPDF);

router.get("/admin/users", isLogin, loadAllUsers)
router.patch("/admin/users/block/:id", isLogin, blockedUsers);
router.patch("/admin/users/unblock/:id", isLogin, activeUsers);

router.get("/admin/category",isLogin, loadCategory)
router.post("/admin/category",isLogin,upload.single("categoryImage"),addCategory);
router.post("/admin/category/edit/:id",isLogin,upload.single("categoryImage"),editCategory)
router.post("/admin/category/delete/:id", isLogin, removeCategory)


router.get("/admin/products",isLogin,loadProducts)
router.get("/admin/products/add",isLogin,loadAddProducts)
router.post("/admin/products/add",isLogin,upload.any(),addProduct);
router.get("/admin/products/edit/:id",isLogin,loadEditProduct)
router.post("/admin/products/edit/:id",isLogin, upload.any(), editProduct);
router.post("/admin/products/delete/:id", removeProduct)

router.get("/admin/orders",isLogin,loadOrders)
router.post("/admin/orders",isLogin, editOrderStatus)
router.get("/admin/orders/:id/:itemIndex", isLogin, OrderDetails)
router.post("/admin/return-action",isLogin, handleReturnRequest)

router.get("/admin/coupons",isLogin,loadCoupons)
router.post("/admin/coupons",isLogin,addCoupon)
router.post("/admin/coupons/edit/:id",isLogin,editCoupon)
router.post("/admin/coupons/delete/:id", isLogin, removeCoupon);

router.get("/admin/logout",adminLogout)

   
export default router;
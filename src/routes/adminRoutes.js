import express from "express"
import upload from "../config/multer.js"
import multer from "multer";
const router=express.Router()
import {isLogin,checkSession} from "../middleware/adminAuth.js"
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
    loadProducts,
    loadAddProducts
} from "../controllers/adminController.js"


router.get("/admin/login", checkSession, loadLogin)
router.post("/admin/login", adminLogin)
router.get("/admin/users", isLogin, loadAllUsers)
router.get("/admin/dashboard", isLogin, loadDashboard)
router.get("/admin/block/:id",isLogin, blockedUsers);
router.get("/admin/unblock/:id",isLogin, activeUsers)

router.get("/admin/category",isLogin, loadCategory)
router.post("/admin/category",isLogin,upload.single("categoryImage"),addCategory);
router.post("/admin/category/edit/:id",isLogin,upload.single("categoryImage"),editCategory)
router.post("/admin/category/delete/:id", isLogin, removeCategory)


router.get("/admin/products",isLogin,loadProducts)
router.get("/admin/products/add",isLogin,loadAddProducts)
router.post("/admin/products/add",isLogin,loadAddProducts)




router.get("/admin/logout",adminLogout)




export default router;
import express from "express"
const router=express.Router()
import {
    isLogin,
    checkSession

} from "../middleware/adminAuth.js"

import {
    loadLogin,
    loadDashboard,
    adminLogin,
    loadAllUsers,
    blockedUsers,
    activeUsers,
    adminLogout
} from "../controllers/adminController.js"





router.get("/admin/login", checkSession, loadLogin)
router.post("/admin/login", adminLogin)
router.get("/admin/users", isLogin, loadAllUsers)
router.get("/admin/dashboard", isLogin, loadDashboard)
router.get("/admin/block/:id",isLogin, blockedUsers);
router.get("/admin/unblock/:id",isLogin, activeUsers);
router.get("/admin/logout",adminLogout)




export default router;
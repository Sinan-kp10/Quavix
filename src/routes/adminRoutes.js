import express from "express"
import {
    loadLogin,
    loadUsers
} from "../controllers/adminController.js"
const router=express.Router()

router.get("/admin/login",loadLogin)
router.get("/admin/users",loadUsers)





export default router;
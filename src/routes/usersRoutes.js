import express from "express"
const router=express.Router()
import { isLogin } from "../middleware/auth.js"
import {
    loadLogin,
    loadSingnup,
    loadOtpVerify,
    loadForgottenPass,
    loadHome,
    loadAddAddress,
    loadProfile,
    loadNewPassword,
    login,
    register,
    logout


} from "../controllers/userController.js"





router.get("/",loadHome)
router.get("/login",loadLogin)
router.post("/login",login)

router.get("/register",loadSingnup)
router.post("/register",register)

router.get("/loginVerify",loadOtpVerify)
router.get("/newPassword",loadNewPassword)
router.get("/forgotPassword",loadForgottenPass)
router.get("/addAddress",isLogin,loadAddAddress)
router.get("/profile",isLogin,loadProfile)
router.get("/logout", logout);



export default router;
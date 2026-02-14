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
    logout,
    verifyOtp,
    resendOtp


} from "../controllers/userController.js"
import passport from "passport"





router.get("/",loadHome)
router.get("/login",loadLogin)
router.post("/login",login)

router.get("/register",loadSingnup)
router.post("/register",register)

router.get("/loginVerify",loadOtpVerify)
router.post("/loginVerify", verifyOtp);
router.post("/resend-otp", resendOtp);

router.get("/auth/google",passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/auth/google/callback",passport.authenticate("google", {failureRedirect: "/register"}),(req, res) => {
    req.session.user = {
      name: req.user.name,
      id: req.user._id,
      email: req.user.email
    };

    res.redirect("/");
  }
);




router.get("/newPassword",loadNewPassword)
router.get("/forgotPassword",loadForgottenPass)
router.get("/addAddress",isLogin,loadAddAddress)
router.get("/profile",isLogin,loadProfile)
router.get("/logout", logout);



export default router;
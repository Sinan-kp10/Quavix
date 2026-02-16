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
    resendOtp,
    forgottenPass,
    verifyResetOtp,
    resetPassword,
    updateProfile,
    emailChange,
    verifyEmailOtp


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



router.get("/newPassword",loadNewPassword)
router.post("/newPassword",resetPassword)


router.get("/forgotPassword",loadForgottenPass)
router.post("/forgotPassword", forgottenPass);
router.post("/verifyResetOtp", verifyResetOtp);


router.get("/addAddress",loadAddAddress)
router.get("/profile",isLogin,loadProfile)
router.post("/updateProfile",  updateProfile)
router.post("/verifyEmailResetOtp", emailChange);
router.post("/verifyEmailOtp", verifyEmailOtp);



router.get("/logout", logout);


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





export default router;
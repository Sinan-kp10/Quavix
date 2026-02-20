import express from "express"
const router=express.Router()
import { isLogin } from "../middleware/auth.js"
import upload from "../config/multer.js"
import { googleUserStatus } from "../middleware/googleUser.js"
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
    verifyEmailOtp,
    addAddress,
    loadEditAddress,
    updateAddress,
    deleteAddress,
    uploadProfileImage,
    removeProfileImage



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


router.get("/addAddress",isLogin,loadAddAddress)
router.post("/addAddress", addAddress)
router.get("/editAddress/:id", isLogin,loadEditAddress)
router.post("/editAddress/:id", updateAddress)
router.post("/deleteAddress/:id", deleteAddress)



router.get("/profile",isLogin,loadProfile)
router.post("/updateProfile",  updateProfile)
router.post("/verifyEmailResetOtp", emailChange);
router.post("/verifyEmailOtp", verifyEmailOtp)
import multer from "multer";

router.post("/upload-profile",isLogin,(req, res, next) => {upload.single("profileImage")(req, res, function (err){

  if(err instanceof multer.MulterError){
      req.session.toastMessage = "File too large. Max size is 2MB.";
      req.session.toastType = "error";
      return res.redirect("/profile");

    }else if(err){

      req.session.toastMessage = err.message;
      req.session.toastType = "error";
      return res.redirect("/profile");

    }

      next();
    })

  },
  uploadProfileImage
)
router.post("/remove-profile-image", isLogin, removeProfileImage);



router.get("/logout", logout)

router.get("/auth/google",passport.authenticate("google", {scope: ["profile", "email"]}))

router.get("/auth/google/callback",passport.authenticate("google",{ failureRedirect: "/login"}),googleUserStatus,(req,res)=>{
    
    req.session.user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }

    res.redirect("/");
  }
)




export default router;
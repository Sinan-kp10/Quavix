import express from "express"
const router = express.Router()
import { isLogin } from "../middleware/auth.js"
import upload from "../config/multer.js"
import multer from "multer";
import { profileUploadValidation } from "../middleware/profileUploadValidation.js"
import { googleUserStatus } from "../middleware/googleUser.js"
import passport from "passport"
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
  removeProfileImage,
  notFound

} from "../controllers/userController.js"

import { 

  loadProducts,
  filterProducts,
  searchProducts,
  loadProductDetials,
  loadWishlist,
  AddToWishlist,
  removeFromWishlist,
  loadCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  buyNowProduct,
  loadCheckout,
  checkoutFromCart,
  placeOrder,
  loadOrderSuccess,
  loadOrderHistory,
  loadOrderDetails,
  orderRequest,
  downloadInvoice

} from "../controllers/userProductController.js"

import {

  createRazorpay,
  verifyRazorpay,
  loadPaymentFailed,
  loadWallet

} from "../controllers/paymentController.js"

router.get("/", loadHome)
router.get("/login", loadLogin)
router.post("/login", login)

router.get("/register", loadSingnup)
router.post("/register", register)

router.get("/loginVerify", loadOtpVerify)
router.post("/loginVerify", verifyOtp);
router.post("/resend-otp", resendOtp);



router.get("/newPassword",loadNewPassword)
router.post("/newPassword", resetPassword)


router.get("/forgotPassword", loadForgottenPass)
router.post("/forgotPassword", forgottenPass);
router.post("/verifyResetOtp", verifyResetOtp);


router.get("/addAddress", isLogin, loadAddAddress)
router.post("/addAddress", addAddress)
router.get("/editAddress/:id", isLogin, loadEditAddress)
router.post("/editAddress/:id", updateAddress)
router.post("/deleteAddress/:id", deleteAddress)



router.get("/profile", isLogin, loadProfile)
router.post("/updateProfile", updateProfile)
router.post("/verifyEmailResetOtp", emailChange);
router.post("/verifyEmailOtp", verifyEmailOtp)

router.post("/upload-profile", isLogin, profileUploadValidation, uploadProfileImage);
router.post("/remove-profile-image", isLogin, removeProfileImage);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleUserStatus, (req, res) => {

  req.session.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email
  }

  res.redirect("/");
})

router.get("/products", loadProducts)
router.get("/products/filter", filterProducts)
router.get("/products/search", searchProducts)
router.get("/product/:slug",loadProductDetials)
router.get("/wishlist",isLogin, loadWishlist);
router.post("/wishlist",isLogin, AddToWishlist)
router.delete("/wishlist/remove", removeFromWishlist);

router.get("/cart",isLogin, loadCart)
router.post("/cart",isLogin, addToCart)
router.delete("/cart/remove",isLogin, removeFromCart)
router.patch("/cart/update-quantity",isLogin, updateCartQuantity);

router.post("/buy-now", isLogin, buyNowProduct)
router.post("/checkout-from-cart", isLogin, checkoutFromCart)
router.get("/checkout", isLogin, loadCheckout);
router.post("/checkout", isLogin, placeOrder)
router.get("/order-success/:id", isLogin, loadOrderSuccess)

router.get("/order-history", isLogin, loadOrderHistory)
router.get("/order-details/:id",isLogin, loadOrderDetails)
router.post("/order-request",isLogin, orderRequest)
router.post("/razorpay",isLogin, createRazorpay);
router.post("/verify-razorpay", isLogin,verifyRazorpay)
router.get("/payment-failed",isLogin, loadPaymentFailed)
router.get("/invoice/:orderId",isLogin, downloadInvoice)

router.get("/wallet",isLogin , loadWallet)



router.get("/not-found", notFound)

router.get("/logout", logout)



export default router;
import userModel from "../models/userModal.js"

import {
    loginUser,
    registerUser,
    resendUserOtp

} from "../services/userService.js"


 export const login=async(req,res)=>{
    try{

        const {email,password}=req.body
        
        const user = await loginUser(email, password);
        
        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name
        }

        res.redirect("/")

    }catch (err) {

    let message = "Something went wrong!";
    let type = "error";
    
    if(err.message === "You can login throgh google"){
        message = "You can login throgh google";
    }

    if(err.message === "User does not exist!"){
        message = "User does not exist!";
    }

    if(err.message === "Incorrect password!"){
        message = "Incorrect password!"
    }

    return res.render("user/login", {
        title: "Login-Quavix",
        css: "userStyle",
        toastMessage: message,
        toastType: type
    });

}

}

export const register=async(req,res)=>{
    try{
        const {name,email,password}=req.body
        const result=await registerUser({name,email,password})

        req.session.userOtp = result.otp;
        req.session.userData = result.userData;
        req.session.otpExpiry = Date.now() + (3 * 60 * 1000);
        
        return res.render("user/otp", {
            title: "Login-Quavix",
            css: "userStyle", 
            expiryTime: req.session.otpExpiry|| 0
        });


    }catch(err){
        console.log(err)

        if(err.message === "User already exists!"){
            return res.render("user/signup", {   
                title: "SignUp-Quavix",
                css: "userStyle",
                toastMessage: "User already exists!",
                toastType: "error"
            })
        }

        return res.render("user/signup", {
            title: "SignUp-Quavix",
            css: "userStyle",
            toastMessage:err.message ,
            toastType: "error"
        });

    }

}

export const verifyOtp = async (req, res) => {

    const { otp } = req.body;

    
    if (!otp || otp.length !== 4) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Please enter complete OTP",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0
        });
    }

   
    if (otp !== req.session.userOtp) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Invalid OTP",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0 
        });
    }

    if (Date.now() > req.session.otpExpiry) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "OTP Expired. Please resend.",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0

        });
    }


    
    const newUser = new userModel(req.session.userData);
    await newUser.save();

    req.session.userOtp = null;
    req.session.userData = null;

    return res.render("user/login", {
        title: "Login-Quavix",
        css: "userStyle",
        toastMessage: "Account Created Successfully",
        toastType: "success"
    });
};

export const resendOtp = async (req, res) => {
    try {

        if (!req.session.userData) {
            return res.redirect("/register");
        }

        const email = req.session.userData.email;

        const newOtp = await resendUserOtp(email);

        req.session.userOtp = newOtp;
        req.session.otpExpiry = Date.now() + (3 * 60 * 1000);

        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "New OTP sent successfully!",
            toastType: "success",
            expiryTime: req.session.otpExpiry|| 0
        });

    } catch (err) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Failed to resend OTP",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0

        });
    }
};


export const loadHome=(req,res)=>{

    res.render("user/home",{ title: "Home-Quavix",css:"userStyle" })
}

export const loadLogin=(req,res)=>{
    if(req.session.user){
        return res.redirect("/");  
    }
    res.render("user/login",{ title: "Login-Quavix",css:"userStyle" })
}

export const loadSingnup=(req,res)=>{
    res.render("user/signup",{ title: "SignUp-Quavix",css:"userStyle" })
}

export const loadOtpVerify=(req,res)=>{
    res.render("user/otp",{ title: "Login Verify-Quavix",css:"userStyle", expiryTime: req.session.otpExpiry || 0 })
}
export const loadForgottenPass=(req,res)=>{
    res.render("user/forgottenPass",{ title: "Login Verify-Quavix",css:"userStyle" })
}
export const loadNewPassword=(req,res)=>{
    res.render("user/newPass",{ title: "New Password-Quavix",css:"userStyle" })
}
export const loadAddAddress=(req,res)=>{
    res.render("user/addAddress",{ title: "Add Address-Quavix",css:"userStyle" })
}
export const loadProfile=(req,res)=>{
    res.render("user/profile",{ title: "Profile-Quavix",css:"userStyle" })
}

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        res.redirect("/");
    });
};

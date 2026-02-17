import userModel from "../models/userModal.js"

import {
    loginUser,
    registerUser,
    resendUserOtp,
    sendForgotPassword,
    resetUserPassword,
    updateUserProfile,
    UserEmailChange,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress

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
    
    if(err.message === "Your account has been blocked by the administrator"){
        message = "Your account has been blocked by the administrator"
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
        req.session.otpExpiry = Date.now() + (2 * 60 * 1000);
        
        return res.render("user/otp", {
            title: "Login-Quavix",
            css: "userStyle", 
            expiryTime: req.session.otpExpiry|| 0,
            formAction: "/loginVerify"
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

export const verifyOtp = async (req, res)=>{

    const { otp } = req.body;

    
    if (!otp || otp.length !== 4) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Please enter complete OTP",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0,
            formAction: "/loginVerify"
        });
    }

   
    if (otp !== req.session.userOtp) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Invalid OTP",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0 ,
            formAction: "/loginVerify"
        });
    }

    if (Date.now() > req.session.otpExpiry) {
        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "OTP Expired. Please resend.",
            toastType: "error",
            expiryTime: req.session.otpExpiry || 0,
            formAction: "/loginVerify"

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

        let email
        let formAction
        let expiryKey
        let otpKey

        //Registration 
        if(req.session.userData){
            email=req.session.userData.email
            formAction="/loginVerify"
            expiryKey="otpExpiry"
            otpKey="userOtp"
        }

        //Forgot password 
        else if(req.session.resetEmail){
            email=req.session.resetEmail
            formAction="/verifyResetOtp"
            expiryKey="resetExpiry"
            otpKey="resetOtp"
        }
        //Email Reset
        else if(req.session.newEmail){
            email=req.session.newEmail;
            formAction="/verifyEmailOtp"
            expiryKey="emailOtpExpiry"
            otpKey="emailOtp"
        }

        else {
            return res.redirect("/register");
        }

        const newOtp = await resendUserOtp(email);

        req.session[otpKey] = newOtp;
        req.session[expiryKey] = Date.now() + (2 * 60 * 1000);

        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "New OTP sent successfully!",
            toastType: "success",
            expiryTime: req.session[expiryKey],
            formAction: formAction
        });

    } catch (err) {

        return res.render("user/otp", {
            title: "Verify OTP - Quavix",
            css: "userStyle",
            toastMessage: "Failed to resend OTP",
            toastType: "error",
            expiryTime: 0
        });
    }
};

export const forgottenPass=async(req,res)=>{
    try {
        const {email}=req.body

        const otp =await sendForgotPassword(email)
        req.session.resetOtp=otp
        req.session.resetExpiry= Date.now() + (2 * 60 * 1000);
        req.session.resetEmail = email;

        return res.render("user/otp", {
            title: "Verify Reset OTP",
            css: "userStyle",
            toastMessage: "Reset OTP sent successfully!",
            toastType: "success",
            expiryTime: req.session.resetExpiry || 0,
            formAction: "/verifyResetOtp"
        });




        
    } catch(err){
        let message = "Something went wrong!";
        let type = "error";
        
        if(err.message === "User does not exist!"){
            message = "User does not exist!";
        }

        if(err.message === "Email sending failed"){
            message ="Email sending failed";
        }
        
        if(err.message === "You can login throgh google"){
            message = "You can login throgh google";
        }
        return res.render("user/forgottenPass", {
            title: "Login-Quavix",
            css: "userStyle",
            toastMessage: message,
            toastType: type
        });
    }
}

export const verifyResetOtp = async (req, res)=>{

    const { otp } = req.body;

    if (!otp || otp.length !== 4) {
        return res.render("user/otp", {
            title: "Verify Reset OTP",
            css: "userStyle",
            toastMessage: "Enter complete OTP",
            toastType: "error",
            expiryTime: req.session.resetExpiry|| 0,
            formAction: "/verifyResetOtp"
        });
    }

    if (Date.now() > req.session.resetExpiry) {
        return res.render("user/otp", {
            title: "Verify Reset OTP",
            css: "userStyle",
            toastMessage: "OTP Expired",
            toastType: "error",
            expiryTime: req.session.resetExpiry || 0,
            formAction: "/verifyResetOtp"
        });
    }

    if (otp !== req.session.resetOtp) {
        return res.render("user/otp", {
            title: "Verify Reset OTP",
            css: "userStyle",
            toastMessage: "Invalid OTP",
            toastType: "error",
            expiryTime: req.session.resetExpiry || 0,
            formAction: "/verifyResetOtp"
        });
    }

    return res.redirect("/newPassword");
};

export const resetPassword=async(req,res)=>{
    try {
        const {password}=req.body

    if(!req.session.resetEmail){
        return res.redirect("/forgotPassword");
    }

    await resetUserPassword(req.session.resetEmail,password)
    req.session.resetOtp = null;
    req.session.resetExpiry = null;
    req.session.resetEmail = null;

    return res.render("user/login",{
        title: "Login-Quavix",
        css: "userStyle",
        toastMessage: "Password updated successfully!",
        toastType: "success"
    })
    }catch(err){
        return res.render("user/newPass", {
            title: "New Password-Quavix",
            css: "userStyle",
            toastMessage: err.message,
            toastType: "error"
        });
    }

}


export const updateProfile=async(req,res)=>{

    try {
        const {name,currentPassword,newPassword}=req.body

    const updatedUser= await updateUserProfile(req.session.user.id,{name,currentPassword,newPassword})

    req.session.user.name=updatedUser.name
    return res.render("user/profile", {
        title: "Profile-Quavix",
        css: "userStyle",
        user: updatedUser,
        toastMessage: "Profile updated successfully!",
        toastType: "success"
    })
    }catch(err){

        const user = await userModel.findById(req.session.user.id);

        return res.render("user/profile", {
            title: "Profile-Quavix",
            css: "userStyle",
            user: user,
            toastMessage: err.message,
            toastType: "error"
        });
        
    }

}

export const emailChange=async(req,res)=>{

    try {
        
        const {newEmail}=req.body

        const otp=await UserEmailChange(req.session.user.id,newEmail)
        req.session.emailOtp=otp
        req.session.emailOtpExpiry = Date.now() + (2 * 60 * 1000)
        req.session.newEmail = newEmail; 
        

        return res.render("user/otp", {
            title: "Verify Reset OTP",
            css: "userStyle",
            expiryTime: req.session.emailOtpExpiry || 0,
            formAction: "/verifyEmailOtp"
        });


    }catch(err){

        const user = await userModel.findById(req.session.user.id);


        return res.render("user/profile", {
            title: "Profile-Quavix",
            css: "userStyle",
            user: user,
            toastMessage: err.message,
            toastType: "error"
        });
        
    }
}

export const verifyEmailOtp=async(req, res)=>{

    const {otp}=req.body;

    if (!otp || otp.length !== 4) {
        return res.render("user/otp", {
            title: "Verify Email Change",
            css: "userStyle",
            toastMessage: "Enter complete OTP",
            toastType: "error",
            expiryTime: req.session.emailOtpExpiry,
            formAction: "/verifyEmailOtp"
        });
    }

    if(Date.now() > req.session.emailOtpExpiry){
        return res.render("user/otp", {
            title: "Verify Email Change",
            css: "userStyle",
            toastMessage: "OTP Expired",
            toastType: "error",
            expiryTime: 0,
            formAction: "/verifyEmailOtp"
        });
    }

    if(otp !== req.session.emailOtp){
        return res.render("user/otp", {
            title: "Verify Email Change",
            css: "userStyle",
            toastMessage: "Invalid OTP",
            toastType: "error",
            expiryTime: req.session.emailOtpExpiry,
            formAction: "/verifyEmailOtp"
        });
    }

    
    const user = await userModel.findById(req.session.user.id);
    user.email = req.session.newEmail;
    await user.save();

    req.session.user.email = user.email;

    req.session.emailOtp = null;
    req.session.emailOtpExpiry = null;
    req.session.newEmail = null;

    return res.render("user/profile", {
        title: "Profile-Quavix",
        css: "userStyle",
        user: user,
        toastMessage: "Email updated successfully!",
        toastType: "success"
    });
};

export const addAddress = async (req, res) => {
    try {

        await addUserAddress(req.session.user.id, req.body);
        req.session.toastMessage = "Address added successfully!";
        req.session.toastType = "success";
        return res.redirect("/profile");

    } catch (err) {
        return res.render("user/addAddress", {
            title: "Add Address-Quavix",
            css: "userStyle",
            toastMessage: err.message,
            toastType: "error"
        });
    }
};

export const loadEditAddress=async(req,res)=>{

    try{
        const user= await userModel.findById(req.session.user.id)
        const address= user.address.id(req.params.id)

        if(!address){
           res.redirect("/profile")
        }

        res.render("user/addAddress",{
            title: "Edit Address - Quavix",
            css: "userStyle",
            address: address
        })

    }catch(err){
        res.redirect('/profile')   
    }
    
}

export const updateAddress=async(req,res)=>{

    try {

        await updateUserAddress(req.session.user.id,req.params.id,req.body)
        req.session.toastMessage = "Address updated successfully!"
        req.session.toastType = "success"

        res.redirect("/profile")
        
    } catch(err){
        res.render("user/addAddress", {
            title: "Edit Address - Quavix",
            css: "userStyle",
            address: {...req.body, _id: req.params.id},
            toastMessage: err.message,
            toastType: "error"
        })
    }
}

export const deleteAddress=async(req,res)=>{
    try {
       
        await deleteUserAddress(req.session.user.id,req.params.id)

        req.session.toastMessage = "Address deleted successfully!"
        req.session.toastType = "success"
        res.redirect("/profile")


    }catch(err) {
        req.session.toastMessage = err.message;
        req.session.toastType = "error";

        res.redirect("/profile");
    }
}

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

export const loadOtpVerify=(req, res)=>{

    let action = "/loginVerify";

    if (req.session.resetOtp) {
        action = "/verifyResetOtp";
    }
    if (req.session.emailOtpExpiry) {
        action = "/verifyEmailOtp";
    }


    res.render("user/otp", {
        title: "Login Verify-Quavix",
        css: "userStyle",
        expiryTime: req.session.otpExpiry || req.session.resetExpiry ||req.session.emailOtpExpiry|| 0,
        formAction: action
    });
};

export const loadForgottenPass=(req,res)=>{
    res.render("user/forgottenPass",{ title: "Login Verify-Quavix",css:"userStyle" })
}
export const loadNewPassword=(req,res)=>{
    res.render("user/newPass",{ title: "New Password-Quavix",css:"userStyle" })
}
export const loadAddAddress=(req,res)=>{
    res.render("user/addAddress",{ title: "Add Address-Quavix",css:"userStyle",address:null })
}
export const loadProfile = async (req, res) => {
    try {

        const user = await userModel.findById(req.session.user.id);

        if(!req.session.user) {
            return res.redirect("/login");
        }

        res.render("user/profile", {
            title: "Profile-Quavix",
            css: "userStyle",
            user: user
        });

    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};


export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        res.redirect("/");
    });
};

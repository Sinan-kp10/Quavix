import {
    loginUser,
    registerUser

} from "../services/userService.js"


 export const login=async(req,res)=>{
    try{

        const {email,password}=req.body
        
        const user = await loginUser(email, password);
        
        req.session.user = {
            id: user._id,
            email: user.email
        }

        res.redirect("/")

    }catch (err) {

    let message = "Something went wrong!";
    let type = "error";

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
        console.log(req.body)
        await registerUser({name,email,password})
        
        return res.render("user/login", {
            title: "Login-Quavix",
            css: "userStyle",
            toastMessage: "Successfully Created",
            toastType: "success"   
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
    res.render("user/otp",{ title: "Login Verify-Quavix",css:"userStyle" })
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

import userModel from "../models/userModal.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();
const saltround=10




export const loginUser=async(email,password)=>{
    const user=await userModel.findOne({email}) 
    if(!user){
        throw new Error("User does not exist!");
    }
    if(user.googleId){
        throw new Error("You can login throgh google")
    }
    if (user.status==="blocked") {
        throw new Error("Your account has been blocked by the administrator")
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error("Incorrect password!");
    }
    return user;
}

function generateOtp(){
    return Math.floor(1000 + Math.random() * 9000).toString();

}

const sendVerificationEmail=async(email,otp)=>{
    try{

        const transporter= nodemailer.createTransport({

            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASS
            }
        })

        const info= await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify Your Email - Quavix",
            text:`Your OTP : ${otp}`,
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Please use the OTP below to complete your registration:</p>

                    <div style="
                        display: inline-block;
                        padding: 15px 30px;
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 4px;
                        background-color: #f2f2f2;
                        border-radius: 8px;
                    ">
                        ${otp}
                    </div>

                    <p style="margin-top:20px; font-size: 14px; color: #777;">
                        This OTP will expire in 2 minutes.
                    </p>
                </div>
                `

        })
        return info.accepted.length >0

    }catch(err){
        console.err("Error Sending Email ",err)
        return false

    }

}

export const resendUserOtp=async(email)=>{

    const otp=generateOtp()
    console.log("new OTP :",otp)
    const emailSent= await sendVerificationEmail(email, otp);

    if(!emailSent){
        throw new Error("Email sending failed");
    }
    return otp;

}


export const registerUser = async ({ name, email, password }) => {
    
    const user = await userModel.findOne({ email });
    if(user){
        throw new Error("User already exists!");
    }
    const otp=generateOtp()
    const emailSent= await sendVerificationEmail(email,otp)

    if(!emailSent){
       throw new Error("Email sending failed");
    }

    
    console.log(`OTP sent ${otp}`)

    const hashedPassword = await bcrypt.hash(password, saltround);
    return {
        otp,
        userData: { name, email, password: hashedPassword }
    };
    
};

export const sendForgotPassword=async(email)=>{

    const user=await userModel.findOne({email})
    if(!user){
        throw new Error("User does not exist!")
    }
    if(user.googleId){
        throw new Error("You can login throgh google")
    }
    const otp=generateOtp()
    console.log("forgot otp ",otp)
    const emailSent=await sendVerificationEmail(email,otp)

    if(!emailSent){
        throw new Error("Email sending failed");
    }
    return otp

}

export const resetUserPassword =async(email, newPassword)=>{
    const user = await userModel.findOne({ email });

    const hashedPassword = await bcrypt.hash(newPassword, saltround);
    user.password = hashedPassword;

    await user.save();

    return true;
}

export const updateUserProfile =async(userId,{ name,currentPassword,newPassword})=>{

    const user = await userModel.findById(userId);
    
    let isChanged=false

    if(!user) {
        throw new Error("User not found");
    }
    
    if(name&& name !== user.name){
        user.name=name;
        isChanged=true
        
    }

    if(currentPassword || newPassword){

        if(user.googleId){
            throw new Error("Password change is not allowed for Google-authenticated users")
        }

        if (!currentPassword || !newPassword) {
            throw new Error("Both current and new password are required");
        }

        const isMatch =await bcrypt.compare(currentPassword,user.password);

        if(!isMatch){
            throw new Error("Current password is incorrect");
        }

        const hashedPassword=await bcrypt.hash(newPassword,saltround);
        user.password=hashedPassword;
        isChanged=true
        
    }
    if(!isChanged){
        throw new Error("No changes made");
    }

    await user.save();

    return user;
};

export const UserEmailChange=async(userId,newEmail)=>{

    const user =await userModel.findById(userId)

    if(!user) {
        throw new Error("User not found");
    }
    if(user.googleId){
        throw new Error("Email change is not allowed for Google-authenticated users")
    }
    if(user.email==newEmail){
        throw new Error("Enter new email");
    }
    const existing = await userModel.findOne({ email: newEmail });
    if(existing){
        throw new Error("Email already in use");
    }


    const otp=generateOtp()

    const emailSent= await sendVerificationEmail(newEmail,otp)
    if(!emailSent){
       throw new Error("Email sending failed");
    }
    console.log(`Reset Google OTP : ${otp}`)

    
    return otp

} 

export const addUserAddress=async(userId,addressData)=>{

    const user= await userModel.findById(userId)

    if(!user){
        throw new Error("User not found")
    }

    const {fullname,phone,pincode,street,state,city,addressType } = addressData;
    
    if(!fullname||!phone||!pincode||!street||!state||!city||!addressType){
        throw new Error("All fields are required")
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
        throw new Error("Invalid pincode format");
    }

    user.address.push({
        fullname,
        phone,
        pincode,
        street,
        state,
        city,
        addressType
    })
    await user.save()
    return true
}

export const updateUserAddress=async(userId,addressId,data)=>{

    const user=await userModel.findById(userId)

    if(!user){
        throw new Error("User not found")
    }
    const address= user.address.id(addressId)


    const {fullname,phone,pincode,street,state,city,addressType} = data

    if (!fullname||!phone||!pincode||!street||!state||!city||!addressType) {
        throw new Error("All fields are required");
    }

    address.fullname = fullname;
    address.phone = phone;
    address.pincode = pincode;
    address.street = street;
    address.state = state;
    address.city = city;
    address.addressType = addressType;

    await user.save()
    return true
    
}

export const deleteUserAddress=async(userId,addressId)=>{

    const user =await userModel.findById(userId)
    if(!user){
        throw new Error("user not found")
    }

    const address=user.address.id(addressId)

    if(!address){
        throw new Error("Address not found")
    }

    address.deleteOne()
    await user.save()

    return true;

}


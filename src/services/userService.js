import userModel from "../models/userModal.js"
import bcrypt from "bcrypt"
const saltround=10




export const loginUser=async(email,password)=>{
    const user=await userModel.findOne({email})
    if(!user){
        throw new Error("User does not exist!");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Incorrect password!");
    }
    return user;
}



export const registerUser = async ({ name, email, password }) => {
    const user = await userModel.findOne({ email });
    if (user) {
        throw new Error("User already exists!");
    }
    const hashedPassword = await bcrypt.hash(password, saltround);
    const newUser = new userModel({
        name,
        email,
        password: hashedPassword
    });
    await newUser.save();
    return newUser;
};

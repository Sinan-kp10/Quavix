import dotenv from "dotenv"
dotenv.config();
import users from "../models/userModal.js"

export  const adminLoginAccess=async(email,password)=>{

    const adminEmail=process.env.ADMIN_EMAIL
    const adminPassword=process.env.ADMIN_PASSWORD

    if(adminEmail!==email){
        throw new Error("Invalid Email")
    }

    if(adminPassword!==password){
        throw new Error("Incorrect password")
    }

    return true



}

export const getAllUsers=async(search="",status="all")=>{

    let query={}

    if(search){
        query.$or=[
            {name:{$regex:search , $options:"i" }},
            {email:{$regex:search,$options:"i" }}
        ]
    }

    if(status && status !== "all"){
        query.status = status;
    }


    return await users.find(query).sort({createdAt:-1})
}

export const allBlockedUser=async(id)=>{
    return await users.findByIdAndUpdate(id,{ status: "blocked"},{new:true})
}

export const allActiveUsers=async(id)=>{

    return await users.findByIdAndUpdate(id,{status: "active"},{new:true})
}
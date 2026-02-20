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

export const getAllUsers=async(search="",status="all",page=1,limit=10)=>{

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

    const skip=(page-1)*limit
    const usersList=await users.find(query).sort({createdAt:-1}).skip(skip).limit(limit)

    const totalUsers=await users.countDocuments(query)

    return {
        usersList,totalUsers
    }
}

export const allBlockedUser=async(id)=>{
    return await users.findByIdAndUpdate(id,{ status: "blocked"},{new:true})
}

export const allActiveUsers=async(id)=>{

    return await users.findByIdAndUpdate(id,{status: "active"},{new:true})
}


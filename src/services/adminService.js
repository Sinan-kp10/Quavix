import categoryModal from "../models/category.js"
import cloudinary from "../config/cloudinary.js";
import slugify from "slugify";
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

    if(status !== "all"){
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


export const getAllCategory=async(search="",status="all",page=1,limit=10)=>{

    let query ={ isDeleted: false };

    if(search){
        query.name={$regex:search , $options:"i" } 
    }

    if(status!="all"){
        query.status=status
    }

    const skip=(page-1)*limit
    const categoryList=await categoryModal.find(query).sort({createdAt:-1}).skip(skip).limit(limit)

    const totalCategory=await categoryModal.countDocuments(query)

    return {
        categoryList,totalCategory
    }

}

export const createCategory=async(name,status,file)=>{

    if (!name || name.trim().length < 3) {
        throw new Error("Category name must be at least 3 characters");
    }

    if(!file){
        return null
    }

    const existing = await categoryModal.findOne({ name: name.trim() });
    if(existing){
        throw new Error("Category already exist")
    }
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "category_images" }
    );
    const slug = slugify(name, { lower: true });

    const newCategory = new categoryModal({
        name,
        slug,
        status,
        categoryImage: result.secure_url,
        categoryImageId: result.public_id,
    });

    await newCategory.save();

    return true;

}

export const deleteCategory=async(id)=>{
    const category=await categoryModal.findById(id)
    if (!category) {
        throw new Error("Category not found");
    }
    if(category.isDeleted){
        throw new Error("Category already deleted");
    }
    
    category.isDeleted=true
    await category.save()
    return true
}
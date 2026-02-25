import categoryModal from "../models/category.js"
import productModel from "../models/productModal.js"
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

    let query ={}

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

export const createCategory=async(name,file)=>{

    if (!name || name.trim().length < 3) {
        throw new Error("Category name must be at least 3 characters");
    }

    if(!file){
        return null
    }
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await categoryModal.findOne({slug});
    if(existing){
        throw new Error("Category already exist")
    }
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "category_images" }
    );


    const newCategory = new categoryModal({
        name,
        slug,
        categoryImage: result.secure_url,
        categoryImageId: result.public_id,
    });

    await newCategory.save();

    return true;

}

export const deleteCategory = async (categoryId) => {

    const category = await categoryModal.findById(categoryId);

    if (!category) {
        throw new Error("Category not found");
    }

    if (category.status === "Active") {
        category.status = "Inactive";
    } else {
        category.status = "Active";
    }

    await category.save();
    return true;
};

export const updateCategory=async(categoryId,name,file)=>{

    const category=await categoryModal.findById(categoryId)
    if(!category){
        throw new Error("Category not found")
    }
    let imageUpdated = false;

    if(!name||name.trim().length<3){
        throw new Error("Category name must be at least 3 characters")
    }

    const existing = await categoryModal.findOne({name: name.trim(),_id: { $ne: categoryId }})

    if (existing) {
        throw new Error("Category already exists");
    }
    
    if(category.name==name && !file){
        throw new Error("No changes were made")
    }
    if(file){

        
        await cloudinary.uploader.destroy(category.categoryImageId);

        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "category_images" }
        );

        category.categoryImage = result.secure_url;
        category.categoryImageId = result.public_id;

        imageUpdated = true;
    }

    category.name = name.trim();
    category.slug = slugify(name, { lower: true });

    await category.save();
    return category;
}


export const getAllProducts=async(search="",status="all",stock="",categories="",page=1,limit=10)=>{

    let query ={isDeleted:false}

    if(search){
        query.name={$regex:search , $options:"i" } 
    }

    if(categories){
        query.category=categories
    }

    if(status!="all"){
        query["variants.status"]=status
    }

    if(stock==="in"){
        query["variants.stock"]= {$gt:0}
    }

    if(stock=="out"){
        query["variants.stock"]={$not:{$gt:0}}
    }

    const skip=(page-1)*limit
    const productsList=await productModel.find(query).populate("category").sort({createdAt:-1}).skip(skip).limit(limit)

    const totalProducts=await productModel.countDocuments(query)

    return {
        productsList,totalProducts
    }

}


export const createProducts = async (data) => {

  const {
    name,
    slug,
    category,
    offerPercentage,
    showOnHomepage,
    highlights,
    services,
    description,
    variants
  } = data;


    const formattedVariants = variants.map(v => {

        return {
        attributes: Array.isArray(v.attributes)
            ? v.attributes
                .filter(attr => attr.name && attr.value)
                .map(attr => ({
                    name: attr.name.trim(),
                    value: attr.value.trim()
                }))
            : [],

            price: Number(v.price),
            stock: Number(v.stock),

            images: {
                primary: {
                    url: v.images?.primary?.url || "",
                    publicId: v.images?.primary?.publicId || ""
                },
                gallery: v.images?.gallery || []
            },

            status: v.status || "Active"
        };
    });

    const prices = formattedVariants.map(v => v.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;

    const newProduct = new productModel({
        name,
        slug,
        category,
        offerPercentage: Number(offerPercentage) || 0,
        showOnHomepage,
        highlights,
        services,
        description,
        variants: formattedVariants,
        minPrice
    });

  return await newProduct.save();
};
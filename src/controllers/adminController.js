
import categoryModal from "../models/category.js"
import slugify from "slugify";
import productModel from "../models/productModal.js"
import cloudinary from "../config/cloudinary.js";


import {
    adminLoginAccess,
    getAllUsers,
    allBlockedUser,
    allActiveUsers,
    getAllCategory,
    createCategory,
    deleteCategory,
    updateCategory,
    getAllProducts,
    createProducts
} from "../services/adminService.js"


export const adminLogin=async(req,res)=>{

    try {
        const {email,password}=req.body

    await adminLoginAccess(email,password)
    req.session.admin={
        email: email,
    }
    req.session.toastMessage = "You have logged in successfully"
    req.session.toastType = "success"

    res.redirect("/admin/dashboard")


    }catch(err){

        let message = "Something went wrong!";
        let type = "error";
    
    if(err.message === "Invalid Email"){
        message = "Invalid Email"
    }

    if(err.message === "Incorrect password"){
        message = "Incorrect password"
    }

        res.render("admin/login",{ 
        title: "Admin User Management-Quavix",
        css: "adminStyle" ,
        toastMessage: message ,
        toastType: type
    })
        
    }

}

export const loadAllUsers=async(req,res)=>{
    try{

        const search=req.query.search|| ""
        const status=req.query.status|| "all"
        const page=parseInt(req.query.page) || 1
        const limit = 10

        const {usersList,totalUsers}=await getAllUsers(search,status,page,limit)

        const totalPages= Math.ceil(totalUsers/limit)

        res.render("admin/users", {
            title: "Users Admin - Quavix",
            css: "adminStyle",
            users:usersList,
            search,
            status,
            currentPage:page,
            totalPages,
            noUsers:usersList.length===0
        })
        
    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const blockedUsers=async(req,res)=>{

    await allBlockedUser(req.params.id)
    res.redirect("/admin/users");     

}

export const activeUsers=async(req,res)=>{
    await allActiveUsers(req.params.id)
    res.redirect("/admin/users");
}

export const loadLogin=(req,res)=>{
    res.render("admin/login",{ title: "Login Admin-Quavix",css: "adminStyle" })
}

export const loadDashboard=(req,res)=>{
    res.render("admin/dashboard",{ title: "Users Admin-Quavix",css: "adminStyle" })
}

export const adminLogout=(req,res)=>{
    delete req.session.admin
    res.redirect("/admin/login")
}

export const loadCategory=async(req,res)=>{
 
    try {

        const search=req.query.search || ""
        const status=req.query.status || "all"
        const page=parseInt(req.query.page) || 1
        const limit = 10
        
        const {categoryList,totalCategory}=await getAllCategory(search,status,page,limit)

        const totalPages=Math.ceil(totalCategory/limit)

        res.render("admin/category", {
        title: "Category Admin - Quavix",
        css: "adminStyle",
        categories: categoryList,  
        search,
        status,
        currentPage: page,
        totalPages,
        noCategories: categoryList.length === 0
});

    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const addCategory=async(req,res)=>{
    try {
        
        const {name}=req.body
        const result=await createCategory(name,req.file)
        if (!result) {
            req.session.toastMessage = "Please select an image.";
            req.session.toastType = "error";
            return res.redirect("/admin/category");
        }

        req.session.toastMessage = "Category added successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/category");
        
    }catch(err){
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error"
        res.redirect("/admin/category")
    }
}

export const removeCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const updatedCategory = await deleteCategory(id);

        if (updatedCategory.status === "Active") {
            req.session.toastMessage = "Category restored successfully!";
        } else {
            req.session.toastMessage = "Category deactivated successfully!";
        }

        req.session.toastType = "success";
        res.redirect("/admin/category");

    } catch (err) {
        req.session.toastMessage = err.message || "Action failed";
        req.session.toastType = "error";
        res.redirect("/admin/category");
    }
};

export const editCategory=async(req,res)=>{
    try {
        const {id}=req.params
        const {name}=req.body
        await updateCategory(id,name,req.file)
        req.session.toastMessage = "Category updated successfully!";
        req.session.toastType = "success";
        res.redirect("/admin/category");


    }catch(err){
        req.session.toastMessage = err.message || "Updation failed";
        req.session.toastType = "error";

        res.redirect("/admin/category");
    }
}

export const loadProducts=async(req,res)=>{
 
    try {

        const search=req.query.search || ""
        const status=req.query.status || "all"
        const stock =req.query.stock || ""
        const categories=req.query.category || ""
        const page=parseInt(req.query.page) || 1
        const limit = 10
        
        const {productsList,totalProducts}=await getAllProducts(search,status,stock,categories,page,limit)

        const totalPages=Math.ceil(totalProducts/limit)

        res.render("admin/products", {
            title: "Products Admin - Quavix",
            css: "adminStyle",
            products: productsList, 
            search,
            status,
            stock,
            categories,
            currentPage: page,
            totalPages,
            noProducts: productsList.length === 0
        });

    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const loadAddProducts=async(req,res)=>{
    try {
        const categories=await categoryModal.find({status:"Active"})
        res.render("admin/addProducts",{ title: "Add products Admin-Quavix",css: "adminStyle", categories })

    }catch(err){
        res.redirect("/admin/products")
    }
}


export const addProduct = async (req, res) => {
  try {

    const {
      name,
      category,
      offer,
      highlights,
      services,
      description,
      variants
    } = req.body;

    if (!name || !category || !description) {
      throw new Error("Required fields missing")
    }

    const slug = slugify(name, { lower: true, strict: true });

    const existingProduct = await productModel.findOne({ slug });
    if (existingProduct) {
      throw new Error("Product already exists")
    }

    let parsedVariants = Array.isArray(variants)? variants: JSON.parse(variants);

    for (let i = 0; i < parsedVariants.length; i++) {
      const primaryFile = req.files.find(file =>
        file.fieldname === `variants[${i}][images][primary]`
      );

      if (!primaryFile) {
        throw new Error("Primary image required for each variant");
      }

      const result = await cloudinary.uploader.upload(
        `data:${primaryFile.mimetype};base64,${primaryFile.buffer.toString("base64")}`,
        { folder: "product_images" }
      );

      parsedVariants[i].images = {
        primary: {
          url: result.secure_url,
          publicId: result.public_id
        },
        gallery: []
      };
    }

    const formattedHighlights = highlights ? highlights.split("\n").map(i => i.trim()).filter(Boolean): [];

    const formattedServices = services ? services.split("\n").map(i => i.trim()).filter(Boolean): [];

    await createProducts({
      name,
      slug,
      category,
      offerPercentage: Number(offer) || 0,
      showOnHomepage: false,
      highlights: formattedHighlights,
      services: formattedServices,
      description,
      variants: parsedVariants
    });

    res.redirect("/admin/products");

  } catch (err) {

    req.session.toastMessage = err.message || "Something went wrong.";
    req.session.toastType = "error"
  
    res.redirect("/admin/products/add")
  }
}


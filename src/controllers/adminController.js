
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
    createProducts,
    updateProduct,
    deleteProduct
} from "../services/adminService.js"
import { title } from "node:process";


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
        const selectedCategory=req.query.category || ""
        const page=parseInt(req.query.page) || 1
        const limit = 10

        
        const {productsList,totalProducts}=await getAllProducts(search,status,stock,selectedCategory,page,limit)

        const totalPages=Math.ceil(totalProducts/limit)
        const categories = await categoryModal.find({ status: "Active" });

        res.render("admin/products", {
            title: "Products Admin - Quavix",
            css: "adminStyle",
            products: productsList, 
            search,
            status,
            stock,
            categories,
            selectedCategory,
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
        res.render("admin/addProducts",{ title: "Add products Admin-Quavix",css: "adminStyle", categories,product:null })

    }catch(err){
        res.redirect("/admin/products")
    }
}


export const addProduct = async (req, res) => {
    try{

        const {
            name,
            category,
            offerPercentage,
            highlights,
            services,
            description,
            variants
        } = req.body;

        if (!name || !category || !description) {
            throw new Error("Required fields missing");
        }

        const slug = slugify(name, { lower: true, strict: true });

        const existingProduct = await productModel.findOne({ slug });
        if (existingProduct) {
            throw new Error("Product already exists");
        }

        const parsedVariants = Array.isArray(variants) ? variants: JSON.parse(variants);


        for (let i = 0; i < parsedVariants.length; i++) {

 
            const primaryFile = req.files.find(file =>
                file.fieldname === `variants[${i}][images][primary]`
            );

            if (!primaryFile) {
                throw new Error(`Primary image required for variant ${i + 1}`);
            }

            const primaryUpload = await cloudinary.uploader.upload(
                `data:${primaryFile.mimetype};base64,${primaryFile.buffer.toString("base64")}`,
                { folder: "product_images" }
            );

            const galleryFiles = req.files.filter(file =>
                file.fieldname.startsWith(`variants[${i}][images][gallery]`)
            );

            const gallery = [];

            for (const file of galleryFiles) {

                const upload = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    { folder: "product_images" }
                );

                gallery.push({
                    url: upload.secure_url,
                    publicId: upload.public_id
                });
            }


            parsedVariants[i].images = {
                primary: {
                    url: primaryUpload.secure_url,
                    publicId: primaryUpload.public_id
                },
                gallery: gallery
            };
        }

        const formattedHighlights = highlights ? highlights.split("\n").map(i => i.trim()).filter(Boolean): [];

        const formattedServices = services ? services.split("\n").map(i => i.trim()).filter(Boolean): [];

        await createProducts({
            name,
            slug,
            category,
            offerPercentage: Number(offerPercentage) || 0,
            showOnHomepage: false,
            highlights: formattedHighlights,
            services: formattedServices,
            description,
            variants: parsedVariants
        });

        req.session.toastMessage = "Product added successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/products");

    }catch(err) {
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("/admin/products/add");
    }
};

export const loadEditProduct = async(req,res)=>{
    try {
        
        const product = await productModel.findById(req.params.id).populate("category")
        const categories=await categoryModal.find({status:"Active"})

        if(!product){
            res.redirect("/admin/products")
        }

        res.render("admin/addProducts",{
            title:"Edit Product - Quavix",
            css:"adminStyle",
            categories,
            product
        })


    }catch(err){
        
        res.redirect("/admin/products")
    }
}

export const editProduct = async (req, res) => {
    try{
        const { id } = req.params;

        const {
            name,
            category,
            offerPercentage,
            highlights,
            services,
            description,
            variants
        } = req.body;

        const product = await productModel.findById(id);
        if (!product) throw new Error("Product not found");
        const newSlug = slugify(name, { lower: true, strict: true })

        const parsedVariants = Array.isArray(variants) ? variants: JSON.parse(variants);

        const formattedHighlights = highlights ? highlights.split("\n").map(i => i.trim()).filter(Boolean): [];

        const formattedServices = services ? services.split("\n").map(i => i.trim()).filter(Boolean): [];

        const baseFieldsSame =
        product.name === name && product.slug === newSlug &&
        product.category.equals(category) && 
        product.offerPercentage === Number(offerPercentage) &&
        product.description === description &&
        JSON.stringify(product.highlights) === JSON.stringify(formattedHighlights) &&
        JSON.stringify(product.services) === JSON.stringify(formattedServices);

        const getVariantSignature = (v) => {

            const attrs = (v.attributes || [])
            .filter(a => a.name?.trim() && a.value?.trim())
            .map(a => `${a.name.trim()}-${a.value.trim()}`)
            .sort()
            .join("|");

            return `${attrs}_${Number(v.price)}_${Number(v.stock)}_${v.status}`;
        };

        const existingSignatures = product.variants.map(getVariantSignature).sort();

        const incomingSignatures = parsedVariants.map(getVariantSignature).sort();

        const variantsSame =JSON.stringify(existingSignatures) === JSON.stringify(incomingSignatures);

        const imagesUploaded = req.files?.length > 0;

        if (baseFieldsSame && variantsSame && !imagesUploaded) {
            req.session.toastMessage = "No changes were made";
            req.session.toastType = "error";
            return res.redirect(`/admin/products/edit/${id}`);
        }

        const existingProduct = await productModel.findOne({
            slug: newSlug,
            _id: { $ne: id }
        });

        if(existingProduct) {
            req.session.toastMessage = "Product with this name already exists.";
            req.session.toastType = "error";
            return res.redirect("back");
        }


        for (let i = 0; i < parsedVariants.length; i++) {

        const updatedVariant = parsedVariants[i];
        const existingVariant = product.variants[i];

        if (!updatedVariant.images) {
            updatedVariant.images = {};
        }


        const primaryField = `variants[${i}][images][primary]`;

        const primaryFile = req.files?.find(file =>
            file.fieldname === primaryField
        );

        if (primaryFile) {

            const result = await cloudinary.uploader.upload(
            `data:${primaryFile.mimetype};base64,${primaryFile.buffer.toString("base64")}`,
            { folder: "product_images" }
            );

            updatedVariant.images.primary = {
                url: result.secure_url,
                publicId: result.public_id
            };

        } else {

            updatedVariant.images.primary =
            existingVariant?.images?.primary || {};
        }



        let gallery = [];

        if (Array.isArray(existingVariant?.images?.gallery)) {
            gallery = existingVariant.images.gallery.map(img => ({
                url: img.url,
                publicId: img.publicId
            }));
        }

        if (!gallery[0]) gallery[0] = null;
        if (!gallery[1]) gallery[1] = null;


        const secondaryField = `variants[${i}][images][gallery][0]`;

        const secondaryFile = req.files?.find(file =>
            file.fieldname === secondaryField
        );

        if (secondaryFile) {

            const upload = await cloudinary.uploader.upload(
            `data:${secondaryFile.mimetype};base64,${secondaryFile.buffer.toString("base64")}`,
            { folder: "product_images" }
            );

            gallery[0] = {
                url: upload.secure_url,
                publicId: upload.public_id
            };
        }

        const otherField = `variants[${i}][images][gallery][1]`;

        const otherFile = req.files?.find(file =>
            file.fieldname === otherField
        );

        if (otherFile) {

            const upload = await cloudinary.uploader.upload(
            `data:${otherFile.mimetype};base64,${otherFile.buffer.toString("base64")}`,
            { folder: "product_images" }
            );

            gallery[1] = {
                url: upload.secure_url,
                publicId: upload.public_id
            };
        }

        updatedVariant.images.gallery =
            gallery.filter(img => img && img.url && img.publicId);
        }

        await updateProduct(id, {
            name,
            slug:newSlug,
            category,
            offerPercentage: Number(offerPercentage) || 0,
            highlights: formattedHighlights,
            services: formattedServices,
            description,
            variants: parsedVariants
        });

        req.session.toastMessage = "Product updated successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/products");

    } catch (err) {
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("back");
    }
};

export const removeProduct=async(req,res)=>{
    try {

        const {id}=req.params

        const updatedProduct=await deleteProduct(id) 
        if (updatedProduct.isDeleted) {
            req.session.toastMessage = "Product restored successfully!";
        } else {
            req.session.toastMessage = "Product deactivated successfully!";
        }

        req.session.toastType = "success";
        res.redirect("/admin/products")
        
    }catch(err){
        req.session.toastMessage = err.message || "Action failed";
        req.session.toastType = "error";
        res.redirect("/admin/products");
    }
}


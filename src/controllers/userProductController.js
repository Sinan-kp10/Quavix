import userModel from "../models/userModal.js"
import productModel from "../models/productModal.js"
import categoryModel from "../models/category.js"

import { 

    getAllProducts,
    getFilterdProduct,
    findProducts

} from "../services/userProductService.js"


export const loadProducts=async(req,res)=>{
    try {

        const products = await getAllProducts()

        const categories= await categoryModel.find({status:"Active"})

        res.render("user/products",{
            title:"products-Quavix",
            css: "userStyle" ,
            products,
            categories
        })
        
    }catch(err){
        console.log(err)
        req.session.toastMessage = "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("/")

    }
}

export const filterProducts=async(req,res)=>{
    try {

        const {categories,sortPrice,sortName}=req.query;

        const products= await getFilterdProduct(categories,sortPrice,sortName)

        res.json({success: true,products});
        
    } catch(err){
        console.log(err)
        res.status(500).json({ success: false });
    }
}

export const searchProducts=async(req,res)=>{
    try {

        const {q}=req.query
        const products=await findProducts(q)
        if (!q || q.trim() === "") {
            return res.redirect("/products");
        }
        const categories = await categoryModel.find({});

        res.render("user/products", {
            title:"products-Quavix",
            css: "userStyle" ,
            products,
            categories,
            searchQuery: q
        })
        
    }catch(err){
        res.status(500).json({success:false})
        
    }
}
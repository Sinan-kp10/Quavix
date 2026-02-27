import userModel from "../models/userModal.js"
import productModel from "../models/productModal.js"
import categoryModel from "../models/category.js"
import wishlistModel from "../models/wishlistModel.js"

import {

    getAllProducts,
    getFilterdProduct,
    findProducts

} from "../services/userProductService.js"


export const loadProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const products = await getAllProducts(category)

        const categories = await categoryModel.find({ status: "Active" })

        res.render("user/products", {
            title: "products-Quavix",
            css: "userStyle",
            products,
            categories
        })

    } catch (err) {
        console.log(err)
        req.session.toastMessage = "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("/")

    }
}

export const filterProducts = async (req, res) => {
    try {

        const { categories, sortPrice, sortName } = req.query;

        const products = await getFilterdProduct(categories, sortPrice, sortName)

        res.json({ success: true, products });

    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false });
    }
}

export const searchProducts = async (req, res) => {
    try {

        const { q } = req.query
        const products = await findProducts(q)
        if (!q || q.trim() === "") {
            return res.redirect("/products");
        }
        const categories = await categoryModel.find({});

        res.render("user/products", {
            title: "products-Quavix",
            css: "userStyle",
            products,
            categories,
            searchQuery: q
        })

    } catch (err) {
        res.status(500).json({ success: false })

    }
}

export const loadProductDetials = async (req, res) => {
    try {
        const { slug } = req.params;
        const { variant } = req.query;

        const product = await productModel.findOne({ slug, isDeleted: false }).populate("category")

        if (!product) {
            return res.redirect("/products");
        }

        let activeVariant;

        if (variant) {
            activeVariant = product.variants.find(v => v._id.toString() === variant);
        }

        if (!activeVariant) {
            activeVariant = product.variants.find(v => v.status === "Active") || product.variants[0];
        }

        const colorVariants = product.variants.filter(v => v.attributes.some(attr => attr.name.toLowerCase() === "color"))

        const relatedProducts = await productModel.find({ _id: { $ne: product._id },category: product.category._id, isDeleted: false}).populate("category");

        res.render("user/productDetails", {
            title: `${product.name} - Quavix`,
            css: "userStyle",
            product,
            activeVariant,
            colorVariants,
            relatedProducts
        })

    } catch (err) {
        console.log(err);
        res.redirect("/products");
    }
};


export const loadWishlist = async (req, res) => {
    try {

        const userId = req.session.user.id;

        if (!userId) {
            return res.redirect("/login");
        }

        const wishlist = await wishlistModel.findOne({ user: userId }).populate({path: "items.product", populate: { path: "category" }});

        res.render("user/wishlist", {
            title: "My Wishlist - Quavix",
            css: "userStyle",
            wishlist
        });

    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};
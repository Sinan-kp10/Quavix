import userModel from "../models/userModal.js"
import productModel from "../models/productModal.js"
import categoryModel from "../models/category.js"
import wishlistModel from "../models/wishlistModel.js"
import cartModel from "../models/cartModel.js"

import {

    getAllProducts,
    getFilterdProduct,
    findProducts,
    addWishlistService,
    addToCartService,
    removeFromCartService

} from "../services/userProductService.js"



export const loadProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const products = await getAllProducts(category)

        const categories = await categoryModel.find({ status: "Active" })

        let wishlistItems = [];

        if (req.session.user) {
            const wishlist = await wishlistModel.findOne({
                user: req.session.user.id
            });

            if (wishlist) {
                wishlistItems = wishlist.items.map(item => ({
                    product: item.product.toString(),
                    variant: item.variant.toString()
                }));
            }
        }

        res.render("user/products", {
            title: "products-Quavix",
            css: "userStyle",
            products,
            categories,
            wishlistItems
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
        const categories = await categoryModel.find({})

        let wishlistItems = [];

        if (req.session.user) {
            const wishlist = await wishlistModel.findOne({
                user: req.session.user.id
            });

            if (wishlist) {
                wishlistItems = wishlist.items.map(item => ({
                    product: item.product.toString(),
                    variant: item.variant.toString()
                }));
            }
        }


        res.render("user/products", {
            title: "products-Quavix",
            css: "userStyle",
            products,
            categories,
            searchQuery: q,
            wishlistItems
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

        let isWishlisted = false;

        if (req.session.user) {
            const wishlist = await wishlistModel.findOne({
                user: req.session.user.id
            });

            if (wishlist) {
                isWishlisted = wishlist.items.some(item =>
                    item.product.toString() === product._id.toString() &&
                    item.variant.toString() === activeVariant._id.toString()
                );
            }
        }

        res.render("user/productDetails", {
            title: `${product.name} - Quavix`,
            css: "userStyle",
            product,
            activeVariant,
            colorVariants,
            relatedProducts,
            isWishlisted
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
}

export const AddToWishlist = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                loginRequired: true,
                message: "Please login to use wishlist"
            });
        }

        const userId = req.session.user.id
        const { productId, variantId } = req.body;

        const result = await addWishlistService(
            userId,
            productId,
            variantId
        )

        res.json({
            success: true,
            added: result.added,
             message: result.added
                ? "Added to wishlist"
                : "Removed from wishlist"
        });

    } catch (err) {

        res.status(500).json({ success: false, message:"Something Went Wrong" });
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId, variantId } = req.body;

        await wishlistModel.updateOne(
            { user: userId },
            { $pull: {
                    items: {
                        product: productId,
                        variant: variantId
                    }
                }
            }
        )

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
}

export const loadCart = async (req, res) => {

    try {

        const userId = req.session.user.id;

        const cart = await cartModel.findOne({ user: userId }).populate("items.product");

        res.render("user/cart", {
            title: "My Cart - Quavix",
            css: "userStyle",
            cart
        })

    } catch (err) {
 
        res.redirect("/");
    }

}

export const addToCart=async(req,res)=>{
    try {
        if(!req.session.user){
            return res.status(401).json({success:false})
        }

        const userId=req.session.user.id
        const {productId,variantId}=req.body

        await addToCartService(userId,productId,variantId)

        res.json({success:true,message:"Product added to cart!"})

    }catch(err){
        res.status(400).json({ success: false });
    }
}

export const removeFromCart = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.status(401).json({success: false,message: "Login required"})
        }

        const userId = req.session.user.id;
        const { productId, variantId } = req.body;

        await removeFromCartService(userId, productId, variantId);

        res.json({
            success: true,
            message: "Product removed from cart"
        });

    } catch (err) {
        console.error("Remove Cart Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to remove product"
        });
    }
}
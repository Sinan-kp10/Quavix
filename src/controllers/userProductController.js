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
    removeFromCartService,
    updateCartQuantityService

} from "../services/userProductService.js"


export const loadProducts = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = 6;  

        const result = await getFilterdProduct(
            null,
            null,
            null,
            null,
            page,
            limit
        );

        const categories = await categoryModel.find({ status: "Active" });

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
            products: result.products,
            categories,
            wishlistItems,
            totalPages: result.totalPages,
            currentPage: page
        });

    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};

export const filterProducts = async (req, res) => {
    try {

        const { categories, sort, minPrice, maxPrice } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = 6;   

        const result = await getFilterdProduct(
            categories,
            sort,
            minPrice,
            maxPrice,
            page,
            limit
        );

        res.json({
            success: true,
            products: result.products,
            totalPages: result.totalPages,
            currentPage: page
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

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

export const updateCartQuantity = async (req, res) => {
    try {

        const userId = req.session.user.id;
        const { productId, variantId, type } = req.body;

        const newQty = await updateCartQuantityService( userId, productId, variantId, type)

        res.json({success: true,quantity: newQty})

    } catch (err) {
        res.status(400).json({ success: false,message: err.message});
    }
}

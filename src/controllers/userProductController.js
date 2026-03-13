import userModel from "../models/userModal.js"
import productModel from "../models/productModal.js"
import categoryModel from "../models/category.js"
import wishlistModel from "../models/wishlistModel.js"
import cartModel from "../models/cartModel.js"
import orderModel from "../models/orderModel.js"
import walletModel from "../models/walletModel.js"
import pdf from "html-pdf-node"
import ejs from "ejs"
import path from "path"
import fs from "fs"

import {
    
    getFilterdProduct,
    findProducts,
    addWishlistService,
    addToCartService,
    removeFromCartService,
    updateCartQuantityService,
    createOrder,
    getAllOrders,
    getOrderRequest

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

        const products = await productModel.find({ isDeleted: false });

        let prices = [];

        products.forEach(product => {

            const offer = product.offerPercentage || 0;

            product.variants
                .filter(v => v.status === "Active")
                .forEach(variant => {

                    const finalPrice = Math.round(
                        variant.price - (variant.price * offer / 100)
                    );

                    prices.push(finalPrice);
                });

        });

        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 200000;

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
            currentPage: page,
            minPrice,
            maxPrice
        });

    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
}

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
            wishlistItems,
            totalPages: 1,
            currentPage: 1
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

export const buyNowProduct=async(req,res)=>{
    try {

        const {variantId}=req.body

        if(!variantId){
            return res.json({ success: false, message: "Variant required" });
        }

        const product= await productModel.findOne({"variants._id":variantId,isDeleted:false})

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const variant=product.variants.id(variantId)

        if(!variant||variant.status!=="Active"){
            return res.json({ success: false, message: "Variant not available" });
        }

        if (variant.stock <= 0) {
            return res.json({ success: false, message: "Out of stock" });
        }

        req.session.buyNow = {
            productId: product._id,
            variantId: variant._id,
            quantity: 1
        };

        res.json({ success: true });
        
    }catch(err){
        res.json({ success: false, message: "Something went wrong" })
    }
}

export const checkoutFromCart = async (req, res) => {
  try {

    if (!req.session.user || !req.session.user.id) {
      return res.json({
        success: false,
        message: "Please login to continue"
      });
    }

    const cart = await cartModel.findOne({ user: req.session.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({ success: false, message: "Cart empty" });
    }

    for (const item of cart.items) {

      const product = item.product;
      const variant = product.variants.id(item.variant);

      if (!variant || variant.stock < item.quantity) {
        return res.json({
          success: false,
          message: `${product.name} is out of stock`
        });
      }

    }

    req.session.fromCart = true;
    req.session.buyNow = null;

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "Something went wrong while processing checkout."
    });
  }
}

export const loadCheckout = async (req, res) => {
    try {

        const userId = req.session.user.id;

        const user = await userModel.findById(userId);

        if (req.session.buyNow) {

            const { productId, variantId, quantity } = req.session.buyNow;

            const product = await productModel.findById(productId);
            const variant = product.variants.id(variantId);

            const offer = product.offerPercentage || 0;
            const discount = (variant.price * offer) / 100;
            const finalPrice = Math.round(variant.price - discount);

            const totalMRP = variant.price * quantity;
            const totalDiscount = discount * quantity;
            const subtotal = finalPrice * quantity;

            return res.render("user/checkout", {
                title: "Checkout - Quavix",
                css: "userStyle",
                user,
                product,
                variant,
                quantity,
                subtotal,
                totalMRP,
                totalDiscount,
                cancelUrl: `/product/${product.slug}`
            });
        }

        if (req.session.fromCart) {

            const cart = await cartModel
                .findOne({ user: userId })
                .populate("items.product");

            if (!cart || cart.items.length === 0) {
                return res.redirect("/cart");
            }

            let totalMRP = 0;
            let totalDiscount = 0;
            let subtotal = 0;

            cart.items.forEach(item => {

                const product = item.product;
                const variant = product.variants.id(item.variant);
                if (!variant) return;

                const offer = product.offerPercentage || 0;
                const discount = (variant.price * offer) / 100;
                const finalPrice = variant.price - discount;

                totalMRP += variant.price * item.quantity;
                totalDiscount += discount * item.quantity;
                subtotal += finalPrice * item.quantity;
            });

            return res.render("user/checkout", {
                title: "Checkout - Quavix",
                css: "userStyle",
                user,
                cart,
                subtotal,
                totalMRP,
                totalDiscount,
                cancelUrl: "/cart" 
            });
        }

        res.redirect("/cart");

    } catch (err) {
        res.redirect("/not-found");
    }
}

export const placeOrder = async (req, res) => {

    try {

        const userId = req.session.user.id;
        const { addressId, paymentMethod } = req.body;

        if (!["cod", "wallet", "razorpay"].includes(paymentMethod)) {
            throw new Error("Invalid payment method");
        }

        if (paymentMethod === "razorpay") {

            req.session.checkoutData = {
                userId,
                addressId,
                paymentMethod,
                buyNow: req.session.buyNow || null
            };

            return res.json({
                success: true,
                razorpay: true
            });
        }

        const result = await createOrder({
            userId,
            addressId,
            paymentMethod,
            buyNowData: req.session.buyNow || null
        });

        req.session.buyNow = null;
        req.session.fromCart = null;

        res.json({
            success: true,
            orderId: result.orderId
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
};
export const loadOrderSuccess=async(req,res)=>{
    try{

        const {id}=req.params
        const order=await orderModel.findOne({ orderId:id })

        if (!order) {
            return res.redirect("/not-found");
        }

        res.render("user/orderSuccess", {
            title: "Order Completed- Quavix",
            css: "userStyle",
            order
        });


    }catch(err){
        console.log(err)
        res.redirect("/not-found")
    }
}
export const loadOrderHistory = async (req, res) => {

    try {

        const userId = req.session.user.id
        const status = req.query.status || "all"
        const search = req.query.search || ""
        const page = parseInt(req.query.page) || 1
        const limit = 4

        const { ordersList, totalOrders } = await getAllOrders(userId, status, search,page,limit)

        const totalPages = Math.ceil(totalOrders / limit)

        res.render("user/orderHistory", {
            title: "My Orders - Quavix",
            css: "userStyle",
            orders: ordersList,
            status,
            search,
            page,
            totalPages
        })

    } catch (err) {
        console.log(err)
        res.redirect("/")
    }
}

export const loadOrderDetails = async (req, res) => {
    try {

        const { id } = req.params
        const variantId = req.query.item

        const order = await orderModel.findOne({ orderId: id })

        if (!order) {
            return res.redirect("/order-history")
        }

  
        let item = order.items.find(i => 
            i.variantId.toString() === variantId
        )


        if (!item) {
            item = order.items[0]
        }

        const requestData = getOrderRequest(order)

        res.render("user/orderDetails", {
            title: "Order Details - Quavix",
            css: "userStyle",
            order,
            item,   
            requestType: requestData.requestType,
            requestAllowed: requestData.requestAllowed
        })

    } catch (err) {
        console.log(err)
        res.redirect("/order-history")
    }
}

export const orderRequest = async (req,res)=>{

    try{

        const {orderId, reason, description,variantId} = req.body

        const order = await orderModel.findOne({orderId})

        if(!order){
           return res.redirect("/order-history")
        }

        const item = order.items.find(i => i.variantId.toString() === variantId)

        if(!item){
            return res.redirect("/order-details/" + order.orderId)
        }
        
        if(!reason){
                throw new Error("Reason required")
            }

        if(!description || description.trim().length < 6){
            throw new Error("Description must contain at least 6 characters")
        }


        if(item.orderStatus === "delivered"){

            if(!item.deliveredAt){
                return res.redirect("/order-details/" + order.orderId)
            }

            const days = (Date.now() - new Date(item.deliveredAt)) / (1000 * 60 * 60 * 24)

            if(days > 7){
                return res.redirect("/order-details/" + order.orderId)
            }

            
            item.returnVariantId = variantId
            item.returnReason = reason
            item.returnDescription = description
            item.returnedAt = new Date()

            item.orderStatus = "return_Request"

            req.session.toastMessage = "Return request submitted. Waiting for admin approval"
            req.session.toastType = "success"

        }else{

            if(item.paymentStatus=="paid"){

                item.cancelReason = reason
                item.cancelDescription = description
                item.cancelledAt = new Date()
                item.orderStatus = "cancelled"

                await productModel.updateOne(
                    { "variants._id": item.variantId },
                    { $inc: { "variants.$.stock": item.quantity } }
                )

                const user=await userModel.findById(req.session.user.id)

                let wallet= await walletModel.findOne({userId:user.id})

                if(!wallet){

                    wallet=new walletModel({
                        userId:user,
                        balance:0,
                        transactions: []

                    })
                }

                const refundAmount = item.total

                wallet.balance += refundAmount

                wallet.transactions.push({
                    date:new Date(),
                    description: "Cancellation refund",
                    type: "credit",
                    amount: refundAmount,
                    orderId: order._id
                })

                item.paymentStatus ="refunded"

                req.session.toastMessage = "Refund successfully added to your wallet"
                req.session.toastType = "success"
                await wallet.save()


            }else{

                item.cancelReason = reason
                item.cancelDescription = description
                item.cancelledAt = new Date()
                item.orderStatus = "cancelled"

                await productModel.updateOne(
                    { "variants._id": item.variantId },
                    { $inc: { "variants.$.stock": item.quantity } }
                )
            }
            

        }

        await order.save()

        res.redirect(`/order-details/${order.orderId}?item=${variantId}`)

    }catch(err){
        console.log(err)
        res.redirect("/order-history")
    }

}

export const downloadInvoice = async (req, res) => {

    try {

        const { orderId } = req.params

        const order = await orderModel
            .findOne({ orderId })
            .populate("user")

        if (!order) {
            return res.redirect("/order-history")
        }

        const templatePath = path.join(process.cwd(), "views", "user", "invoice.ejs")

        const html = await ejs.renderFile(templatePath, { order })

        const file = { content: html }

        const options = {
            format: "A4",
            printBackground: true
        }

        const pdfBuffer = await pdf.generatePdf(file, options)

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${order.orderId}.pdf`
        )

        res.send(pdfBuffer)

    } catch (error) {

        console.log(error)
        res.redirect("/order-history")

    }

}


import productModel from "../../models/productModal.js"
import cartModel from "../../models/cartModel.js"
import userModal from "../../models/userModal.js"
import orderModel from "../../models/orderModel.js"
import couponsModel from "../../models/couponsModel.js"


export const createOrder = async ({ userId,addressId, paymentMethod,buyNowData,couponCode,walletCalculation = false}) => {

    const user = await userModal.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const address = user.address.id(addressId);

    if (!address) {
        throw new Error("Address not found");
    }

    let items = [];
    let subtotal = 0;
    let totalDiscount = 0;
    let couponDiscount = 0;
    let finalTotal = 0;



    if (buyNowData) {

        const { productId, variantId, quantity } = buyNowData;

        const product = await productModel.findById(productId).populate("category");

        if (!product) {
            throw new Error("Product not found");
        }

        const variant = product.variants.id(variantId);

        if (!variant || variant.status !== "Active" || product.isDeleted || product.category?.status !== "Active") {
            throw new Error("Product is no longer available");
        }

        if (variant.stock < quantity) {
            throw new Error("Insufficient stock");
        }

        const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);

        const discount = (variant.price * offer) / 100;

        const finalPrice = Math.round(variant.price - discount);

        const total = finalPrice * quantity;

        subtotal = total;
        totalDiscount = discount * quantity;

        items.push({
            product: product._id,
            productName: product.name,
            productImage: variant.images.primary.url,
            variantId: variant._id,
            attributes: variant.attributes,
            quantity,
            price: finalPrice,
            total,
            paymentStatus: paymentMethod === "cod" ? "pending" : "paid"
        });

        if (!walletCalculation) {
            variant.stock -= quantity;
            await product.save();
        }
    }


    else {

        const cart = await cartModel.findOne({ user: userId }).populate({ path: "items.product", populate: { path: "category" } });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        for (const item of cart.items) {

            const product = item.product;

            const variant = product.variants.id(item.variant);

            if (!variant || product.isDeleted || product.category?.status !== "Active") {
                throw new Error(`${product.name} is no longer available`);
            }

            if (variant.stock < item.quantity) {
                throw new Error(`${product.name} is out of stock`);
            }

            const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);

            const discount = (variant.price * offer) / 100;

            const finalPrice = Math.round(variant.price - discount);

            const total = finalPrice * item.quantity;

            subtotal += total;
            totalDiscount += discount * item.quantity;

            items.push({
                product: product._id,
                productName: product.name,
                productImage: variant.images.primary.url,
                variantId: variant._id,
                attributes: variant.attributes,
                quantity: item.quantity,
                price: finalPrice,
                total,
                paymentStatus: paymentMethod === "cod" ? "pending" : "paid"
            });

            if (!walletCalculation) {
                variant.stock -= item.quantity;
                await product.save();
            }
        }

        if (!walletCalculation) {
            await cartModel.updateOne(
                { user: userId },
                { $set: { items: [] } }
            );
        }
    }


    if (couponCode) {

        const coupon = await couponsModel.findOne({
            code: couponCode,
            status: "Active",
            expiryDate: { $gte: new Date() }
        });

        if (!coupon) {
            throw new Error("Applied coupon is no longer available or has expired");
        }

        if (coupon.couponType === "percentage") {
            let discount = (subtotal * coupon.discountAmount) / 100;
            if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
            couponDiscount = Math.round(discount);
        } else {
            couponDiscount = coupon.discountAmount;
        }
    }

    finalTotal = Math.max(0, subtotal - couponDiscount);

    if (walletCalculation) {
        return {
            totalAmount: finalTotal
        };
    }

    const order = new orderModel({
        user: userId,
        items,
        shippingAddress: address,
        paymentMethod,
        subtotal,
        discount: totalDiscount,
        shippingCharge: 0,
        couponDiscount,
        couponCode: couponCode || null,
        totalAmount: finalTotal
    });

    await order.save();

    return {
        orderId: order.orderId,
        totalAmount: finalTotal
    };
}

export const getAllOrders = async (userId, status = "all", search = "", page = 1, limit = 6) => {

    let query = { user: userId }

    if (search) {
        query.$or = [
            { orderId: { $regex: search, $options: "i" } },
            { "items.productName": { $regex: search, $options: "i" } }
        ]
    }

    const skip = Math.max((page - 1) * limit, 0)

    const orders = await orderModel.find(query).sort({ createdAt: -1 })

    let items = []

    orders.forEach(order => {

        order.items.forEach(item => {

            if (status !== "all" && item.orderStatus !== status) return

            items.push({
                ...item.toObject(),
                orderId: order.orderId,
                createdAt: order.createdAt,
                subtotal: order.subtotal,
                couponDiscount: order.couponDiscount,
                totalAmount: order.totalAmount
            })

        })

    })

    const totalItems = items.length

    const paginatedItems = items.slice(skip, skip + limit)

    return {
        ordersList: paginatedItems,
        totalOrders: totalItems
    }
}

export const getOrderRequest = (item) => {

    let requestType = null
    let requestAllowed = false

    if(
        item.orderStatus === "pending" ||
        item.orderStatus === "shipped" ||
        item.orderStatus === "out_for_delivery"
    ){
        requestType = "cancel"
        requestAllowed = true
    }

    if(item.orderStatus === "delivered" && item.deliveredAt){

        const today = new Date()
        const deliveredDate = new Date(item.deliveredAt)

        const days = Math.floor(
            (today - deliveredDate) / (1000 * 60 * 60 * 24)
        )

        if(days <= 7){
            requestType = "return"
            requestAllowed = true
        }
    }

    return {
        requestType,
        requestAllowed
    }
}
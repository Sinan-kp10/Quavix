import productModel from "../../models/productModal.js"
import wishlistModel from "../../models/wishlistModel.js"
import cartModel from "../../models/cartModel.js"
import userModal from "../../models/userModal.js"
import orderModel from "../../models/orderModel.js"
import couponsModel from "../../models/couponsModel.js"



export const getFilterdProduct = async (
    categories,
    sort,
    minPrice,
    maxPrice,
    page = 1,
    limit = 6
) => {

    let query = { isDeleted: false };

    if (categories) {
        query.category = { $in: categories.split(",") };
    }

    const products = await productModel.find(query).populate("category");

    const getFinalPrice = (price, offer = 0) =>
        Math.round(price - (price * offer / 100));

    let variantList = [];
    products.forEach(product => {

        const offer = Math.max(product.offerPercentage || 0, product.category?.categoryOffer || 0);

        product.variants
            .filter(v => v.status === "Active")
            .forEach(variant => {

                const finalPrice = getFinalPrice(variant.price, offer);

                const minCheck = minPrice ? finalPrice >= Number(minPrice) : true;
                const maxCheck = maxPrice ? finalPrice <= Number(maxPrice) : true;

                if (minCheck && maxCheck) {
                    variantList.push({
                        ...product.toObject(),
                        variants: [variant],
                        finalPrice
                    });
                }

            });
    });

    if (sort) {

        variantList.sort((a, b) => {

            if (sort === "priceLow")
                return a.finalPrice - b.finalPrice;

            if (sort === "priceHigh")
                return b.finalPrice - a.finalPrice;

            if (sort === "nameAZ")
                return a.name.localeCompare(b.name);

            if (sort === "nameZA")
                return b.name.localeCompare(a.name);

            return 0;
        });
    }

    const totalItems = variantList.length;
    const totalPages = Math.ceil(totalItems / limit);

    const start = (page - 1) * limit;
    const paginated = variantList.slice(start, start + limit);

    return {
        products: paginated,
        totalPages
    };
};
export const findProducts = async (search) => {

    let query = { isDeleted: false };

    if (!search) {
        return await productModel.find(query);
    }

    const words = search.toLowerCase().split(" ");

    let nameFilter = [];
    let priceFilter = null;
    let attributeFilter = [];

    words.forEach(word => {

        if (!isNaN(word)) {
            priceFilter = Number(word);
        }
        else if (word.includes("gb")) {
            attributeFilter.push(word);
        }

        else {
            nameFilter.push(word);
        }

    });

    let mongoQuery = { isDeleted: false };


    if (nameFilter.length > 0) {
        mongoQuery.name = {
            $regex: nameFilter.join("|"),
            $options: "i"
        };
    }

    let products = await productModel.find(mongoQuery).populate("category");

    products = products.map(product => {

        const matchedVariants = product.variants.filter(variant => {

            const priceMatch = priceFilter? variant.price <= priceFilter : true;

            const attributeMatch = attributeFilter.length > 0 ? variant.attributes.some(attr =>
                attributeFilter.some(filterValue =>
                attr.value.toLowerCase().replace(/\s+/g, "") === filterValue.replace(/\s+/g, ""))): true;

            return priceMatch && attributeMatch && variant.status === "Active";

        });

        return {...product.toObject(), variants: matchedVariants };

    }).filter(product => product.variants.length > 0);

    return products;
}

export const addWishlistService = async (userId, productId, variantId) => {

    let wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
        wishlist = new wishlistModel({
            user: userId,
            items: [{ product: productId, variant: variantId }]
        });

        await wishlist.save();
        return { added: true };
    }

    const existingIndex = wishlist.items.findIndex(item =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId
    )

    if (existingIndex > -1) {
        wishlist.items.splice(existingIndex, 1);
        await wishlist.save();
        return { added: false };
    }

    wishlist.items.push({
        product: productId,
        variant: variantId
    });

    await wishlist.save();
    return { added: true };
}

export const addToCartService = async (userId, productId, variantId) => {

    const product = await productModel.findById(productId)
    if (!product || product.isDeleted) {
        throw new Error("This product is currently not available");
    }

    const variant = product.variants.find(v =>
        v._id.toString() === variantId.toString()
    );

    if (!variant) {
        throw new Error("Variant not found")
    }

    if (variant.stock <= 0) {
        throw new Error("Product is out of stock")
    }

    let cart = await cartModel.findOne({ user: userId })

    if (!cart) {
        cart = new cartModel({
            user: userId,
            items: []
        });
    }

    const existingItem = cart.items.find(item =>
        item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (existingItem) {

        if (existingItem.quantity + 1 > variant.stock) {
            throw new Error(`Only ${variant.stock} items available in stock`);
        }

        existingItem.quantity += 1;
        

    } else {

        

        cart.items.push({
            product: productId,
            variant: variantId,
            quantity: 1
        });
    }

    
    
    await cart.save()

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const removeFromCartService = async (userId, productId, variantId) => {

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return false;

    cart.items = cart.items.filter(item =>
        !(item.product.toString() === productId && item.variant.toString() === variantId)
    );

    await cart.save();

    return true;
}

export const updateCartQuantityService = async (userId,productId,variantId,changeType) =>{

    const cart = await cartModel.findOne({ user: userId });
    if(!cart) throw new Error("Cart not found");

    const item = cart.items.find(item => item.product.toString() === productId && item.variant.toString() === variantId)

    if(!item) throw new Error("Item not found")

    const product = await productModel.findById(productId);
    const variant = product.variants.find(v =>
        v._id.toString() === variantId
    )

    if(!variant) throw new Error("Variant not found");

    if(changeType === "inc"){

        if (item.quantity + 1 > variant.stock){
            throw new Error(`Only ${variant.stock} items available`)
        }

        item.quantity += 1

    }else if(changeType === "dec"){

        if(item.quantity > 1){
            item.quantity -= 1;
        }
    }

    await cart.save()

    return item.quantity
}

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

        if (!variant || variant.status !== "Active" || product.isDeleted) {
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

            if (!variant || product.isDeleted) {
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

        if (coupon && subtotal >= coupon.minPurchaseAmount) {
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
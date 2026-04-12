import userModel from "../../models/userModal.js"
import productModel from "../../models/productModal.js"
import orderModel from "../../models/orderModel.js"
import walletModel from "../../models/walletModel.js"
import { generateInvoicePDF } from "../../utils/pdfGenerator.js"

import {
    createOrder,
    getAllOrders,
    getOrderRequest
} from "../../services/user/userOrderService.js"

export const placeOrder = async (req, res) => {

    try {

        const userId = req.session.user.id;
        const { addressId, paymentMethod } = req.body;

        if (!["cod", "wallet", "razorpay"].includes(paymentMethod)) {
            throw new Error("Invalid payment method");
        }

        if (paymentMethod === "razorpay") {


            const checkoutCheck = await createOrder({
                userId,
                addressId,
                paymentMethod,
                buyNowData: req.session.buyNow || null,
                couponCode: req.session.couponCode || null,
                walletCalculation: true
            });

            req.session.checkoutData = {
                userId,
                addressId,
                paymentMethod,
                buyNow: req.session.buyNow || null,
                couponCode: req.session.couponCode || null
            };

            return res.json({
                success: true,
                razorpay: true,
                amount: checkoutCheck.totalAmount
            });
        }


        let wallet;

        if (paymentMethod === "wallet") {

            wallet = await walletModel.findOne({ userId });

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            const walletCalculation = await createOrder({
                userId,
                addressId,
                paymentMethod,
                buyNowData: req.session.buyNow || null,
                couponCode: req.session.couponCode || null,
                walletCalculation: true
            });

            if (wallet.balance < walletCalculation.totalAmount) {
                throw new Error("Insufficient wallet balance");
            }

            wallet.balance -= walletCalculation.totalAmount;

            wallet.transactions.push({
                date: new Date(),
                description: "Order Payment",
                type: "debit",
                amount: walletCalculation.totalAmount
            });

            await wallet.save();
        }


        const result = await createOrder({
            userId,
            addressId,
            paymentMethod,
            buyNowData: req.session.buyNow || null,
            couponCode: req.session.couponCode || null
        });



        req.session.buyNow = null;
        req.session.fromCart = null;
        req.session.couponCode = null;



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
}

export const loadOrderSuccess = async (req, res) => {
    try {

        const { id } = req.params
        const order = await orderModel.findOne({ orderId: id })

        if (!order) {
            return res.redirect("/not-found");
        }

        res.render("user/orderSuccess", {
            title: "Order Completed- Quavix",
            css: "userStyle",
            order
        });


    } catch (err) {
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

        const { ordersList, totalOrders } = await getAllOrders(userId, status, search, page, limit)

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

        let finalItemTotal = item.total
        let itemDiscount = 0


        if (item.discountPercentage) {
            const productDiscount = (item.price * item.discountPercentage) / 100
            itemDiscount += productDiscount * item.quantity
        }


        if (order.couponDiscount && order.subtotal > 0) {
            const itemShare = item.total / order.subtotal
            const couponShare = order.couponDiscount * itemShare

            itemDiscount += couponShare
        }


        finalItemTotal = Math.round(item.total - itemDiscount)
        const finalPrice = Math.round(finalItemTotal / item.quantity)

        res.render("user/orderDetails", {
            title: "Order Details - Quavix",
            css: "userStyle",
            order,
            item,
            requestType: requestData.requestType,
            requestAllowed: requestData.requestAllowed,
            finalItemTotal,
            itemDiscount,
            finalPrice
        })

    } catch (err) {
        console.log(err)
        res.redirect("/order-history")
    }
}

export const orderRequest = async (req, res) => {

    try {

        const { orderId, reason, description, variantId } = req.body

        const order = await orderModel.findOne({ orderId })

        if (!order) {
            return res.redirect("/order-history")
        }

        const item = order.items.find(i => i.variantId.toString() === variantId)

        if (!item) {
            return res.redirect("/order-details/" + order.orderId)
        }




        if (!reason) {
            throw new Error("Reason required")
        }

        if (!description || description.trim().length < 6) {
            throw new Error("Description must contain at least 6 characters")
        }


        if (item.orderStatus === "delivered") {

            if (!item.deliveredAt) {
                return res.redirect("/order-details/" + order.orderId)
            }

            const days = (Date.now() - new Date(item.deliveredAt)) / (1000 * 60 * 60 * 24)

            if (days > 7) {
                return res.redirect("/order-details/" + order.orderId)
            }


            item.returnVariantId = variantId
            item.returnReason = reason
            item.returnDescription = description
            item.returnedAt = new Date()

            item.orderStatus = "return_Request"

            req.session.toastMessage = "Return request submitted. Waiting for admin approval"
            req.session.toastType = "success"

        } else {

            if (item.paymentStatus == "paid") {

                item.cancelReason = reason
                item.cancelDescription = description
                item.cancelledAt = new Date()
                item.orderStatus = "cancelled"

                await productModel.updateOne(
                    { "variants._id": item.variantId },
                    { $inc: { "variants.$.stock": item.quantity } }
                )

                const user = await userModel.findById(req.session.user.id)

                let wallet = await walletModel.findOne({ userId: user.id })

                if (!wallet) {

                    wallet = new walletModel({
                        userId: user,
                        balance: 0,
                        transactions: []

                    })
                }

                let refundAmount = item.total

                if (order.couponDiscount && order.subtotal > 0) {

                    const itemShare = item.total / order.subtotal

                    const couponShare = order.couponDiscount * itemShare

                    refundAmount = Math.round(item.total - couponShare)

                }

                wallet.balance += refundAmount

                wallet.transactions.push({
                    date: new Date(),
                    description: "Cancellation refund",
                    type: "credit",
                    amount: refundAmount,
                    orderId: order._id
                })

                item.paymentStatus = "refunded"

                req.session.toastMessage = "Refund successfully added to your wallet"
                req.session.toastType = "success"
                await wallet.save()


            } else {

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

    } catch (err) {
        console.log(err)
        res.redirect("/order-history")
    }

}

export const downloadInvoice = async (req, res) => {
    try {

        const { orderId } = req.params;
        const itemId = req.query.itemId;

        const order = await orderModel.findOne({ orderId }).populate("user");

        if (!order) {
            return res.redirect("/order-history");
        }

        const item = order.items.find(i => i.variantId && i.variantId.toString() === itemId)

        if (!item) {
            return res.redirect("/order-history");
        }

        const product = await productModel.findById(item.product).populate("category");
        const offer = Math.max(product?.offerPercentage || 0, product?.category?.categoryOffer || 0);


        let finalItemTotal = item.total;
        let couponDiscount = 0;

        if (order.couponDiscount > 0 && order.subtotal > 0) {
            const itemShare = item.total / order.subtotal;
            couponDiscount = Math.round(order.couponDiscount * itemShare);

            finalItemTotal = Math.round(item.total - couponDiscount);
        }

        let originalPrice = item.price;
        let originalTotal = item.total;
        let productDiscount = 0;

        if (offer > 0) {
            originalPrice = Math.round(item.price / (1 - offer / 100));
            originalTotal = originalPrice * item.quantity;
            productDiscount = originalTotal - item.total;
        }


        const itemDiscount = productDiscount + couponDiscount;

        const finalPrice = Math.round(finalItemTotal / item.quantity);


        const pdfBuffer = await generateInvoicePDF({
            order,
            item,
            finalItemTotal,
            finalPrice,
            originalPrice,
            originalTotal,
            productDiscount,
            couponDiscount,
            itemDiscount,
            offer
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${order.orderId}-${itemId}.pdf`
        );

        res.send(pdfBuffer);

    } catch (error) {
        console.log(error);
        res.redirect("/order-history");
    }
};

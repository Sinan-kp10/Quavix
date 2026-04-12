
import orderModel from "../../models/orderModel.js";
import userModal from "../../models/userModal.js";
import walletModel from "../../models/walletModel.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../utils/orderStatus.js";

import { getAllOrders } from "../../services/admin/adminOrderService.js"

export const loadOrders = async (req, res) => {

    try {

        const search = req.query.search || ""
        const status = req.query.status || "all"
        const page = parseInt(req.query.page) || 1
        const limit = 6

        const { items, totalItems } = await getAllOrders(search, status, page, limit)

        const totalPages = Math.ceil(totalItems / limit)

        const returnRequests = await orderModel.find({"items.orderStatus": ORDER_STATUS.RETURN_REQUEST}).populate("user", "email")

        res.render("admin/orders", {
            title: "Manage Orders - Quavix",
            css: "adminStyle",
            orders: items,
            status,
            search,
            currentPage: page,
            totalPages,
            returnRequests
        })

    } catch (err) {

        console.log(err)
        res.redirect("/admin/dashboard")

    }
}

export const editOrderStatus = async (req, res) => {
    try {

        const { orderId, itemIndex, status } = req.body;

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.redirect("/admin/orders");
        }

        const item = order.items[Number(itemIndex)];


        if (
            item.orderStatus === ORDER_STATUS.CANCELLED ||
            item.orderStatus === ORDER_STATUS.RETURNED
        ) {
            return res.redirect("/admin/orders");
        }

        if (status) {
            item.orderStatus = status; 
        }

        if (status === ORDER_STATUS.DELIVERED) {
            item.deliveredAt = new Date();
            item.paymentStatus = PAYMENT_STATUS.PAID;
        }

        if (status === ORDER_STATUS.CANCELLED) {
            item.cancelledAt = new Date();
        }

        await order.save();

        res.redirect("/admin/orders");

    } catch (error) {
        console.log(error);
        res.redirect("/admin/orders");
    }
}

export const OrderDetails = async (req, res) => {
    try {

        const { id, itemIndex } = req.params

        const order = await orderModel.findById(id).populate("user", "email")

        if (!order) {
            return res.redirect("/admin/orders")
        }

        const item = order.items[itemIndex]

        if (!item) {
            return res.redirect("/admin/orders")
        }
        let finalItemTotal = item.total

        if(order.couponDiscount && order.subtotal > 0){

            const itemShare = item.total / order.subtotal
            const couponShare = order.couponDiscount * itemShare

            finalItemTotal = Math.round(item.total - couponShare)
        }

        res.render("admin/orderDetails", {
            title: "Order Details - Quavix",
            css: "adminStyle",
            order,
            item,
            finalItemTotal
        })

    } catch (err) {
        console.log(err)
        res.redirect("/admin/orders")
    }
}

export const handleReturnRequest = async (req, res) => {

    try {

        const { orderId, variantId, action, rejectReason } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) return res.redirect("/admin/orders");

        const itemIndex = order.items.findIndex(
            i => i.variantId.toString() === variantId
        );

        if (itemIndex === -1) return res.redirect("/admin/orders");

        const item = order.items[itemIndex];

        if (item.orderStatus !== ORDER_STATUS.RETURN_REQUEST) {
            return res.redirect(`/admin/orders/${orderId}/${itemIndex}`);
        }

        if (action === "approve") {

            item.orderStatus = ORDER_STATUS.RETURNED;

            const user = await userModal.findById(order.user);

            let wallet = await walletModel.findOne({ userId: user.id });

            if (!wallet) {
                wallet = new walletModel({
                    userId: user.id,
                    balance: 0,
                    transactions: []
                });
            }

            let refundAmount = item.total;

            if (order.couponDiscount && order.subtotal > 0) {

                const itemShare = item.total / order.subtotal;
                const couponShare = order.couponDiscount * itemShare;

                refundAmount = Math.round(item.total - couponShare);
            }

            wallet.balance += refundAmount;

            wallet.transactions.push({
                date: new Date(),
                description: "Return refund",
                type: "credit",
                amount: refundAmount,
                orderId: order._id
            });

            item.paymentStatus = PAYMENT_STATUS.REFUNDED;

            await wallet.save();
        }

        if (action === "reject") {

            if (rejectReason.length < 3) {
                throw new Error("Please provide a reason for rejection");
            }

            item.orderStatus = ORDER_STATUS.RETURN_REJECTED;
            item.returnRejectReason = rejectReason;
        }

        await order.save();

        res.redirect(`/admin/orders/${orderId}/${itemIndex}`);

    } catch (err) {
        console.log(err);
        res.redirect("/admin/orders");
    }
}

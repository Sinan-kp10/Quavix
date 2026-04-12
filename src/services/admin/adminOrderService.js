import dotenv from "dotenv"
dotenv.config();
import orderModel from "../../models/orderModel.js";


export const getAllOrders = async (search = "", status = "all", page = 1, limit = 4) => {

    let query = {}

    if (search) {
        query.$or = [
            { orderId: { $regex: search, $options: "i" } },
            { "shippingAddress.fullname": { $regex: search, $options: "i" } }
        ]
    }

    const orders = await orderModel.find(query).populate("user", "email").sort({ createdAt: -1 })


    let items = []

    orders.forEach(order => {

        order.items.forEach(item => {

            if (status === "all" || item.orderStatus === status) {

                items.push({
                    order,
                    item,
                    itemIndex: order.items.indexOf(item)
                })
            }

        })

    })

    const totalItems = items.length

    const start = (page - 1) * limit
    const paginatedItems = items.slice(start, start + limit)

    return {
        items: paginatedItems,
        totalItems
    }
}
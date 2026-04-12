import categoryModal from "../../models/category.js"
import productModel from "../../models/productModal.js"
import cloudinary from "../../config/cloudinary.js";
import slugify from "slugify";
import dotenv from "dotenv"
dotenv.config();
import users from "../../models/userModal.js"
import orderModel from "../../models/orderModel.js";
import { ORDER_STATUS } from "../../utils/orderStatus.js";


export const adminLoginAccess = async (email, password) => {

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (adminEmail !== email) {
        throw new Error("Invalid Email")
    }

    if (adminPassword !== password) {
        throw new Error("Incorrect password")
    }

    return true
}

export const getAllUsers = async (search = "", status = "all", page = 1, limit = 10) => {

    let query = {}

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    }

    if (status !== "all") {
        query.status = status;
    }

    const skip = (page - 1) * limit
    const usersList = await users.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalUsers = await users.countDocuments(query)

    return {
        usersList, totalUsers
    }
}

export const allBlockedUser = async (id) => {
    return await users.findByIdAndUpdate(id, { status: "blocked" }, { new: true })
}

export const allActiveUsers = async (id) => {

    return await users.findByIdAndUpdate(id, { status: "active" }, { new: true })
}

export const getAllCategory = async (search = "", status = "all", page = 1, limit = 10) => {

    let query = {}

    if (search) {
        query.name = { $regex: search, $options: "i" }
    }

    if (status != "all") {
        query.status = status
    }

    const skip = (page - 1) * limit
    const categories = await categoryModal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    for (let category of categories) {
        const count = await productModel.countDocuments({ category: category._id, isDeleted: false });

        category.productCount = count;
    }

    const totalCategory = await categoryModal.countDocuments(query)
    return {
        categoryList: categories,
        totalCategory
    }
}

export const createCategory = async (name, offer, file) => {

    if (!name || name.trim().length < 3) {
        throw new Error("Category name must be at least 3 characters");
    }

    if (!file) {
        return null
    }
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await categoryModal.findOne({ slug });
    if (existing) {
        throw new Error("Category already exist")
    }
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "category_images" }
    );


    const newCategory = new categoryModal({
        name,
        slug,
        categoryOffer: offer || 0,
        categoryImage: result.secure_url,
        categoryImageId: result.public_id,
    });

    await newCategory.save();

    return true;

}

export const deleteCategory = async (categoryId) => {

    const category = await categoryModal.findById(categoryId);

    if (!category) {
        throw new Error("Category not found");
    }

    if (category.status === "Active") {
        category.status = "Inactive";
    } else {
        category.status = "Active";
    }

    await category.save();
    return true;
}

export const updateCategory = async (categoryId, name, offer, file) => {

    const category = await categoryModal.findById(categoryId)
    if (!category) {
        throw new Error("Category not found")
    }
    let imageUpdated = false;

    if (!name || name.trim().length < 3) {
        throw new Error("Category name must be at least 3 characters")
    }

    const existing = await categoryModal.findOne({ name: name.trim(), _id: { $ne: categoryId } })

    if (existing) {
        throw new Error("Category already exists");
    }

    if (category.name == name && !file && category.categoryOffer == offer) {
        throw new Error("No changes were made")
    }
    if (file) {


        await cloudinary.uploader.destroy(category.categoryImageId);

        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "category_images" }
        );

        category.categoryImage = result.secure_url;
        category.categoryImageId = result.public_id;

        imageUpdated = true;
    }

    category.name = name.trim();
    category.slug = slugify(name, { lower: true })
    category.categoryOffer = offer || 0

    await category.save();
    return category;
}

const buildDateFilter = (filter) => {
    let dateFilter = {};
    const now = new Date();

    if (filter === "today") {
        const start = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { createdAt: { $gte: start } };
    }

    if (filter === "week") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        dateFilter = { createdAt: { $gte: start } };
    }

    if (filter === "month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: start } };
    }

    if (filter === "year") {
        const start = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: start } };
    }

    return dateFilter;
}

export const getDashboardData = async (filter) => {

    const dateFilter = buildDateFilter(filter);

    const orders = await orderModel.find(dateFilter);

    const totalOrders = orders.length;
    const totalUsers = await users.countDocuments();
    const filteredUsers = await users.countDocuments(dateFilter);
    const totalProducts = await productModel.countDocuments();


    let totalRevenue = 0;

    orders.forEach(order => {
        order.items.forEach(item => {

            if (item.orderStatus === ORDER_STATUS.DELIVERED) {
                let finalItemTotal = item.total;
                if (order.couponDiscount && order.subtotal > 0) {
                    const itemShare = item.total / order.subtotal;
                    const couponShare = order.couponDiscount * itemShare;
                    finalItemTotal = Math.round(item.total - couponShare);
                }
                totalRevenue += finalItemTotal;
            }
        });
    });

    let monthlyRevenue = Array(12).fill(0);

    orders.forEach(order => {
        const month = new Date(order.createdAt).getMonth();

        order.items.forEach(item => {
            if (item.orderStatus === ORDER_STATUS.DELIVERED) {
                let finalItemTotal = item.total;
                if (order.couponDiscount && order.subtotal > 0) {
                    const itemShare = item.total / order.subtotal;
                    const couponShare = order.couponDiscount * itemShare;
                    finalItemTotal = Math.round(item.total - couponShare);
                }
                monthlyRevenue[month] += finalItemTotal;
            }
        });
    });


    let weeklyOrders = Array(7).fill(0);

    orders.forEach(order => {
        const day = new Date(order.createdAt).getDay();
        weeklyOrders[day]++;
    });

    return {
        totalOrders,
        totalUsers,
        filteredUsers,
        totalProducts,
        totalRevenue,
        monthlyRevenue,
        weeklyOrders,
        dateFilter
    }
}

export const getTopProducts = async (dateFilter) => {

    return await orderModel.aggregate([

        { $match: dateFilter },

        { $unwind: "$items" },

        {
            $match: {
                "items.orderStatus": ORDER_STATUS.DELIVERED,
                "items.returnedAt": { $exists: false }
            }
        },

        {
            $group: {
                _id: "$items.product",
                productName: { $first: "$items.productName" },
                productImage: { $first: "$items.productImage" },
                totalSold: { $sum: "$items.quantity" }
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productData"
            }
        },

        { $unwind: "$productData" },

        {
            $lookup: {
                from: "categories",
                localField: "productData.category",
                foreignField: "_id",
                as: "categoryData"
            }
        },

        { $unwind: "$categoryData" },

        {
            $project: {
                productName: 1,
                productImage: 1,
                totalSold: 1,
                categoryName: "$categoryData.name"
            }
        },

        { $sort: { totalSold: -1 } },
        { $limit: 3 }
    ]);
}

export const getTopCategories = async (dateFilter) => {

    return await orderModel.aggregate([

        { $match: dateFilter },

        { $unwind: "$items" },

        {
            $match: {
                "items.orderStatus": ORDER_STATUS.DELIVERED,
                "items.returnedAt": { $exists: false }
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productData"
            }
        },

        { $unwind: "$productData" },

        {
            $lookup: {
                from: "categories",
                localField: "productData.category",
                foreignField: "_id",
                as: "categoryData"
            }
        },

        { $unwind: "$categoryData" },

        {
            $group: {
                _id: "$categoryData._id",
                categoryName: { $first: "$categoryData.name" },
                totalSold: { $sum: "$items.quantity" }
            }
        },

        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);
}

export const reportService = async (search = "", filter = "all", page = 1, limit = 10, startDate = null, endDate = null) => {

    const skip = (page - 1) * limit

    let query = {};

    if (search) {
        query.$or = [
            { orderId: { $regex: search, $options: "i" } }
        ]
    }

    const now = new Date()

    if (filter === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: start };
    }

    if (filter === "week") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query.createdAt = { $gte: start };
    }

    if (filter === "month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        query.createdAt = { $gte: start };
    }

    if (filter === "year") {
        const start = new Date(now.getFullYear(), 0, 1);
        query.createdAt = { $gte: start };
    }

    if (filter === "custom" && startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate + "T23:59:59.999Z")
        };
    }

    const orderList = await orderModel.find(query).sort({ createdAt: -1 }).populate("user").skip(skip).limit(limit)

    const totalOrders = await orderModel.countDocuments(query);


    return {
        orderList,
        totalOrders,
    };

}
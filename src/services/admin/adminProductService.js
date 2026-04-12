
import productModel from "../../models/productModal.js"
import dotenv from "dotenv"
dotenv.config();




export const getAllProducts = async (search = "", status = "all", stock = "", selectedCategory = "", page = 1, limit = 10) => {

    let query = {}

    if (search) {
        query.name = { $regex: search, $options: "i" }
    }

    if (selectedCategory) {
        query.category = selectedCategory
    }

    if (status === "Active") {
        query.isDeleted = false;
    }
    else if (status === "Inactive") {
        query.isDeleted = true;
    }

    if (stock === "in") {
        query["variants.stock"] = { $gt: 0 }
    }

    if (stock == "out") {
        query["variants.stock"] = { $not: { $gt: 0 } }
    }

    const skip = (page - 1) * limit
    const productsList = await productModel.find(query).populate("category").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalProducts = await productModel.countDocuments(query)

    return {
        productsList, totalProducts
    }

}

export const createProducts = async (data) => {

    const {
        name,
        slug,
        category,
        offerPercentage,
        showOnHomepage,
        highlights,
        services,
        description,
        variants
    } = data;

    const formattedVariants = variants.map(v => {

        const safePrimary = {
            url: v.images?.primary?.url || "",
            publicId: v.images?.primary?.publicId || ""
        };

        const safeGallery = Array.isArray(v.images?.gallery)
            ? v.images.gallery
                .filter(img => img && img.url && img.publicId)
                .map(img => ({
                    url: img.url,
                    publicId: img.publicId
                }))
            : [];

        return {
            attributes: Array.isArray(v.attributes)
                ? v.attributes
                    .filter(attr => attr.name && attr.value)
                    .map(attr => ({
                        name: attr.name.trim(),
                        value: attr.value.trim()
                    }))
                : [],

            price: Number(v.price),
            stock: Number(v.stock),

            images: {
                primary: safePrimary,
                gallery: safeGallery
            },

            status: v.status || "Active"
        };
    });

    const prices = formattedVariants.map(v => v.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const newProduct = new productModel({
        name,
        slug,
        category,
        offerPercentage: Number(offerPercentage) || 0,
        showOnHomepage,
        highlights,
        services,
        description,
        variants: formattedVariants,
        minPrice,
        maxPrice
    });

    return await newProduct.save();
}

export const updateProduct = async (id, data) => {

    const {
        name,
        slug,
        category,
        offerPercentage,
        showOnHomepage,
        highlights,
        services,
        description,
        variants
    } = data;

    const formattedVariants = variants.map(v => {

        const safePrimary = {
            url: v.images?.primary?.url || "",
            publicId: v.images?.primary?.publicId || ""
        };

        const safeGallery = Array.isArray(v.images?.gallery)
            ? v.images.gallery
                .filter(img => img && img.url && img.publicId)
                .map(img => ({
                    url: img.url,
                    publicId: img.publicId
                }))
            : [];

        return {
            _id: v._id || undefined,
            attributes: Array.isArray(v.attributes)
                ? v.attributes
                    .filter(attr => attr.name && attr.value)
                    .map(attr => ({
                        name: attr.name.trim(),
                        value: attr.value.trim()
                    }))
                : [],

            price: Number(v.price),
            stock: Number(v.stock),

            images: {
                primary: safePrimary,
                gallery: safeGallery
            },

            status: v.status || "Active"
        };
    });

    const prices = formattedVariants.map(v => v.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;

    return await productModel.findByIdAndUpdate(
        id,
        {
            name,
            slug,
            category,
            offerPercentage,
            showOnHomepage,
            highlights,
            services,
            description,
            variants: formattedVariants,
            minPrice
        },
        { new: true }
    );
}
export const deleteProduct = async (id) => {

    const product = await productModel.findById(id)

    if (!product) {
        throw new Error("Product not found")
    }

    product.isDeleted = !product.isDeleted;

    await product.save()
    return true
}
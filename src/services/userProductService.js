import productModel from "../models/productModal.js"
import wishlistModel from "../models/wishlistModel.js";


export const getAllProducts=async(category=null)=>{

    let filter = {isDeleted:false};

    if(category){
        filter.category = category;
    }

    const products = await productModel.find(filter).populate("category").sort({createdAt:-1})

    return products
}

export const getFilterdProduct = async (categories, sortPrice, sortName) => {

    let query = { isDeleted: false };

    if (categories) {
        query.category = { $in: categories.split(",") };
    }

 
    let sortOption = { createdAt: -1 }; 

    if (sortPrice === "priceLow") {
        sortOption = { minPrice: 1 };    
    } 
    else if (sortPrice === "priceHigh") {
        sortOption = { maxPrice: -1 };     
    } 
    else if (sortName === "nameAZ") {
        sortOption = { name: 1 };
    } 
    else if (sortName === "nameZA") {
        sortOption = { name: -1 };
    }

    const products = await productModel.find(query).populate("category").sort(sortOption);

    if (sortPrice === "priceLow") {
        products.forEach(p =>
            p.variants.sort((a, b) => a.price - b.price)
        );
    }
    else if (sortPrice === "priceHigh") {
        products.forEach(p =>
            p.variants.sort((a, b) => b.price - a.price)
        );
    }

    return products;
}

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
        else if (word.includes("gb") || word.includes("tb")) {
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

    let products = await productModel.find(mongoQuery);

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
};

import categoryModal from "../../models/category.js"
import slugify from "slugify";
import productModel from "../../models/productModal.js"
import cloudinary from "../../config/cloudinary.js";
import { compressImage } from "../../utils/imageUpload.js";
import orderModel from "../../models/orderModel.js";
import userModal from "../../models/userModal.js";
import walletModel from "../../models/walletModel.js";
import XLSX from "xlsx";
import XLSXStyle from "xlsx-style";
import PDFDocument from "pdfkit";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../utils/orderStatus.js";



import {
    adminLoginAccess,
    getAllUsers,
    allBlockedUser,
    allActiveUsers,
    getAllCategory,
    createCategory,
    deleteCategory,
    updateCategory,
    getAllProducts,
    createProducts,
    updateProduct,
    deleteProduct,
    getAllOrders,
    getDashboardData,
    getTopProducts,
    getTopCategories,
    reportService

} from "../../services/admin/adminService.js"



export const adminLogin=async(req,res)=>{

    try {
        const {email,password}=req.body

    await adminLoginAccess(email,password)
    req.session.admin={
        email: email,
    }
    req.session.toastMessage = "You have logged in successfully"
    req.session.toastType = "success"

    res.redirect("/admin/dashboard")


    }catch(err){

        let message = "Something went wrong!";
        let type = "error";
    
    if(err.message === "Invalid Email"){
        message = "Invalid Email"
    }

    if(err.message === "Incorrect password"){
        message = "Incorrect password"
    }

        res.render("admin/login",{ 
        title: "Admin User Management-Quavix",
        css: "adminStyle" ,
        toastMessage: message ,
        toastType: type
    })
        
    }

}

export const loadAllUsers=async(req,res)=>{
    try{

        const search=req.query.search|| ""
        const status=req.query.status|| "all"
        const page=parseInt(req.query.page) || 1
        const limit = 10

        const {usersList,totalUsers}=await getAllUsers(search,status,page,limit)

        const totalPages= Math.ceil(totalUsers/limit)

        res.render("admin/users", {
            title: "Users Admin - Quavix",
            css: "adminStyle",
            users:usersList,
            search,
            status,
            currentPage:page,
            totalPages,
            noUsers:usersList.length===0
        })
        
    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const blockedUsers=async(req,res)=>{

    await allBlockedUser(req.params.id)
    res.redirect("/admin/users");     

}

export const activeUsers=async(req,res)=>{
    await allActiveUsers(req.params.id)
    res.redirect("/admin/users");
}

export const loadLogin=(req,res)=>{
    res.render("admin/login",{ title: "Login Admin-Quavix",css: "adminStyle" })
}

export const adminLogout=(req,res)=>{
    delete req.session.admin
    res.redirect("/admin/login")
}

export const loadCategory=async(req,res)=>{
 
    try {

        const search=req.query.search || ""
        const status=req.query.status || "all"
        const page=parseInt(req.query.page) || 1
        const limit = 10
        
        const {categoryList,totalCategory}=await getAllCategory(search,status,page,limit)

        const totalPages=Math.ceil(totalCategory/limit)

        res.render("admin/category", {
        title: "Category Admin - Quavix",
        css: "adminStyle",
        categories: categoryList,  
        search,
        status,
        currentPage: page,
        totalPages,
        noCategories: categoryList.length === 0
});

    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const addCategory=async(req,res)=>{
    try {
        
        const {name,offer}=req.body
        const result=await createCategory(name,offer,req.file)
        if (!result) {
            req.session.toastMessage = "Please select an image.";
            req.session.toastType = "error";
            return res.redirect("/admin/category");
        }

        req.session.toastMessage = "Category added successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/category");
        
    }catch(err){
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error"
        res.redirect("/admin/category")
    }
}

export const removeCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const updatedCategory = await deleteCategory(id);

        if (updatedCategory.status === "Active") {
            req.session.toastMessage = "Category restored successfully!";
        } else {
            req.session.toastMessage = "Category deactivated successfully!";
        }

        req.session.toastType = "success";
        res.redirect("/admin/category");

    } catch (err) {
        req.session.toastMessage = err.message || "Action failed";
        req.session.toastType = "error";
        res.redirect("/admin/category");
    }
};

export const editCategory=async(req,res)=>{
    try {
        const {id}=req.params
        const {name,offer}=req.body
        await updateCategory(id,name,offer,req.file)
        req.session.toastMessage = "Category updated successfully!";
        req.session.toastType = "success";
        res.redirect("/admin/category");


    }catch(err){
        req.session.toastMessage = err.message || "Updation failed";
        req.session.toastType = "error";

        res.redirect("/admin/category");
    }
}

export const loadProducts=async(req,res)=>{
 
    try {

        const search=req.query.search || ""
        const status=req.query.status || "all"
        const stock =req.query.stock || ""
        const selectedCategory=req.query.category || ""
        const page=parseInt(req.query.page) || 1
        const limit = 6

        
        const {productsList,totalProducts}=await getAllProducts(search,status,stock,selectedCategory,page,limit)

        const totalPages=Math.ceil(totalProducts/limit)
        const categories = await categoryModal.find({ status: "Active" });

        res.render("admin/products", {
            title: "Products Admin - Quavix",
            css: "adminStyle",
            products: productsList, 
            search,
            status,
            stock,
            categories,
            selectedCategory,
            currentPage: page,
            totalPages,
            noProducts: productsList.length === 0
        });

    }catch(err){
        console.log(err);
        res.redirect("/admin/dashboard");
    }
}

export const loadAddProducts=async(req,res)=>{
    try {
        const categories=await categoryModal.find({status:"Active"})
        res.render("admin/addProducts",{ title: "Add products Admin-Quavix",css: "adminStyle", categories,product:null })

    }catch(err){
        res.redirect("/admin/products")
    }
}

export const addProduct = async (req, res) => {
    try{

        const {
            name,
            category,
            offerPercentage,
            showOnHomepage,
            highlights,
            services,
            description,
            variants
        } = req.body;

        if (!name || !category || !description ||!highlights ||!services) {
            throw new Error("Required fields missing");
        }

        const slug = slugify(name, { lower: true, strict: true });

        const existingProduct = await productModel.findOne({ slug });
        if (existingProduct) {
            throw new Error("Product already exists");
        }

        const homepageValue = showOnHomepage === "Yes";

        const parsedVariants = Array.isArray(variants) ? variants: JSON.parse(variants);


        for (let i = 0; i < parsedVariants.length; i++) {

 
            const primaryFile = req.files.find(file =>
                file.fieldname === `variants[${i}][images][primary]`
            );

            if (!primaryFile) {
                throw new Error(`Primary image required for variant ${i + 1}`);
            }
            const compressedPrimary = await compressImage(primaryFile.buffer);

            const primaryUpload = await cloudinary.uploader.upload(
                `data:image/webp;base64,${compressedPrimary.toString("base64")}`,
                { folder: "product_images" }
            );

            const galleryFiles = req.files.filter(file =>
                file.fieldname.startsWith(`variants[${i}][images][gallery]`)
            );

            const gallery = [];

            for (const file of galleryFiles) {

                const compressedGallery = await compressImage(file.buffer);

                const upload = await cloudinary.uploader.upload(
                    `data:image/webp;base64,${compressedGallery.toString("base64")}`,
                    { folder: "product_images" }
                );

                gallery.push({
                    url: upload.secure_url,
                    publicId: upload.public_id
                });
            }


            parsedVariants[i].images = {
                primary: {
                    url: primaryUpload.secure_url,
                    publicId: primaryUpload.public_id
                },
                gallery: gallery
            };
        }

        const formattedHighlights = highlights ? highlights.split("\n").map(i => i.trim()).filter(Boolean): [];

        const formattedServices = services ? services.split("\n").map(i => i.trim()).filter(Boolean): [];

        await createProducts({
            name,
            slug,
            category,
            offerPercentage: Number(offerPercentage) || 0,
            showOnHomepage: homepageValue, 
            highlights: formattedHighlights,
            services: formattedServices,
            description,
            variants: parsedVariants
        });

        req.session.toastMessage = "Product added successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/products");

    }catch(err) {
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("/admin/products/add");
    }
} 

export const loadEditProduct = async(req,res)=>{
    try {
        
        const product = await productModel.findById(req.params.id).populate("category")
        const categories=await categoryModal.find({status:"Active"})

        if(!product){
            res.redirect("/admin/products")
        }

        res.render("admin/addProducts",{
            title:"Edit Product - Quavix",
            css:"adminStyle",
            categories,
            product
        })


    }catch(err){
        
        res.redirect("/admin/products")
    }
}

export const editProduct = async (req, res) => {
    try{
        const { id } = req.params;

        const {
            name,
            category,
            offerPercentage,
            showOnHomepage,
            highlights,
            services,
            description,
            variants
        } = req.body;

        const product = await productModel.findById(id);
        if (!product) throw new Error("Product not found");
        const homepageValue = showOnHomepage === "Yes";
        const newSlug = slugify(name, { lower: true, strict: true })

        const parsedVariants = Array.isArray(variants) ? variants: JSON.parse(variants);

        const formattedHighlights = highlights ? highlights.split("\n").map(i => i.trim()).filter(Boolean): [];

        const formattedServices = services ? services.split("\n").map(i => i.trim()).filter(Boolean): [];

        

        const baseFieldsSame =
        product.name === name && product.slug === newSlug &&
        product.category.equals(category) && 
        product.offerPercentage === Number(offerPercentage) &&product.showOnHomepage === homepageValue && 
        product.description === description &&
        JSON.stringify(product.highlights) === JSON.stringify(formattedHighlights) &&
        JSON.stringify(product.services) === JSON.stringify(formattedServices);

        const getVariantSignature = (v) => {

            const attrs = (v.attributes || [])
            .filter(a => a.name?.trim() && a.value?.trim())
            .map(a => `${a.name.trim()}-${a.value.trim()}`)
            .sort()
            .join("|");

            return `${v._id || "new"}_${attrs}_${Number(v.price)}_${Number(v.stock)}_${v.status}`;
        };

        const existingSignatures = product.variants.map(getVariantSignature).sort();

        const incomingSignatures = parsedVariants.map(getVariantSignature).sort();

        const variantsSame =JSON.stringify(existingSignatures) === JSON.stringify(incomingSignatures);

        const imagesUploaded = req.files?.length > 0;

        if (baseFieldsSame && variantsSame && !imagesUploaded) {
            req.session.toastMessage = "No changes were made";
            req.session.toastType = "error";
            return res.redirect(`/admin/products/edit/${id}`);
        }

        const existingProduct = await productModel.findOne({
            slug: newSlug,
            _id: { $ne: id }
        });

        if(existingProduct) {
            req.session.toastMessage = "Product with this name already exists";
            req.session.toastType = "error";
            return res.redirect(`/admin/products/edit/${id}`);
        }


        for (let i = 0; i < parsedVariants.length; i++) {

        const updatedVariant = parsedVariants[i];
        const existingVariant = product.variants.find(v =>
            v._id?.toString() === updatedVariant._id?.toString()
        );

        if (!updatedVariant.images) {
            updatedVariant.images = {};
        }


        const primaryField = `variants[${i}][images][primary]`;

        const primaryFile = req.files?.find(file =>
            file.fieldname === primaryField
        );

        if (primaryFile) {

            const compressed = await compressImage(primaryFile.buffer);

            const result = await cloudinary.uploader.upload(
                `data:image/webp;base64,${compressed.toString("base64")}`,
                { folder: "product_images" }
            );

            updatedVariant.images.primary = {
                url: result.secure_url,
                publicId: result.public_id
            };

        } else {

            updatedVariant.images.primary =
            existingVariant?.images?.primary || {};
        }



        let gallery = [];

        if (Array.isArray(existingVariant?.images?.gallery)) {
            gallery = existingVariant.images.gallery.map(img => ({
                url: img.url,
                publicId: img.publicId
            }));
        }

        if (!gallery[0]) gallery[0] = null;
        if (!gallery[1]) gallery[1] = null;


        const secondaryField = `variants[${i}][images][gallery][0]`;

        const secondaryFile = req.files?.find(file =>
            file.fieldname === secondaryField
        );

        if (secondaryFile) {

            const compressed = await compressImage(secondaryFile.buffer);

            const upload = await cloudinary.uploader.upload(
                `data:image/webp;base64,${compressed.toString("base64")}`,
                { folder: "product_images" }
            );

            gallery[0] = {
                url: upload.secure_url,
                publicId: upload.public_id
            };
        }

        const otherField = `variants[${i}][images][gallery][1]`;

        const otherFile = req.files?.find(file =>
            file.fieldname === otherField
        );

        if (otherFile) {

            const compressed = await compressImage(otherFile.buffer);

            const upload = await cloudinary.uploader.upload(
                `data:image/webp;base64,${compressed.toString("base64")}`,
                { folder: "product_images" }
            );

            gallery[1] = {
                url: upload.secure_url,
                publicId: upload.public_id
            };
        }

        updatedVariant.images.gallery =
            gallery.filter(img => img && img.url && img.publicId);
        }

        await updateProduct(id, {
            name,
            slug:newSlug,
            category,
            offerPercentage: Number(offerPercentage) || 0,
            showOnHomepage: homepageValue,
            highlights: formattedHighlights,
            services: formattedServices,
            description,
            variants: parsedVariants
        });

        req.session.toastMessage = "Product updated successfully!";
        req.session.toastType = "success";

        res.redirect("/admin/products");

    } catch (err) {
        req.session.toastMessage = err.message || "Something went wrong.";
        req.session.toastType = "error";
        res.redirect("back");
    }
}

export const removeProduct=async(req,res)=>{
    try {

        const {id}=req.params

        const updatedProduct=await deleteProduct(id) 
        if (updatedProduct.isDeleted) {
            req.session.toastMessage = "Product restored successfully!";
        } else {
            req.session.toastMessage = "Product deactivated successfully!";
        }

        req.session.toastType = "success";
        res.redirect("/admin/products")
        
    }catch(err){
        req.session.toastMessage = err.message || "Action failed";
        req.session.toastType = "error";
        res.redirect("/admin/products");
    }
}

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
};

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


export const loadDashboard = async (req, res) => {
    try {

        const filter = req.query.filter || "all";

        const data = await getDashboardData(filter);

        const topProducts = await getTopProducts(data.dateFilter);
        const topCategories = await getTopCategories(data.dateFilter);

        res.render("admin/dashboard", {
            title: "Admin Dashboard - Quavix",
            css: "adminStyle",
            filter,
            topProducts,
            topCategories,
            ...data
        });

    } catch (err) {
        console.log(err);
        res.redirect("/admin/dashboard");
    }
};

export const loadReports=async(req,res)=>{

    try {

        const search=req.query.search||""
        const filter = req.query.filter || "all";
        const page=parseInt(req.query.page)||1
        const limit=10

        const startDate=req.query.startDate || null
        const endDate=req.query.endDate || null

        const {orderList,totalOrders}=await reportService(search,filter,page,limit,startDate,endDate)

        const totalPages = Math.ceil(totalOrders / limit)


        res.render("admin/reports",{ 
            title: "Sales and Reports -Quavix",
            css: "adminStyle",
            order:orderList,
            currentPage:page,
            totalPages,
            search,
            filter,
            startDate,
            endDate

        })

        
    } catch (err) {
        console.log(err)
        res.redirect("/admin/dashboard") 
    }
}

export const exportExcel = async (req, res) => {
    try {

        const search = req.query.search || "";
        const filter = req.query.filter || "all";
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;

        const { orderList } = await reportService(
            search, filter, 1, 100000, startDate, endDate
        );

        const formatDate = (date) =>
            new Date(date).toLocaleDateString("en-GB");

        const today = new Date();

        let from = null;
        let to = formatDate(today);


        if (filter === "week") {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            from = formatDate(start);
        } 
        else if (filter === "month") {
            from = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        } 
        else if (filter === "year") {
            from = formatDate(new Date(today.getFullYear(), 0, 1));
        } 
        else if (filter === "custom" && startDate && endDate) {
            from = formatDate(startDate);
            to = formatDate(endDate);
        } 
        else if (filter === "all" && orderList.length > 0) {
            const firstOrder = orderList[orderList.length - 1];
            from = formatDate(firstOrder.createdAt);
        }

        const formatStatus = (status) =>
            status
                ?.replaceAll("_", " ")
                .replace(/\b\w/g, c => c.toUpperCase()) || "Pending";

        const worksheet = XLSX.utils.aoa_to_sheet([]);


        const header = [
            ["Sales Report"],
            [`Generated: ${new Date().toLocaleString()}`]
        ];

        if (
            filter === "all" ||  
            filter === "week" ||
            filter === "month" ||
            filter === "year" ||
            (filter === "custom" && startDate && endDate)
        ) {
            header.push([`Period: ${from} to ${to}`]);
        }

        header.push([]);

        XLSX.utils.sheet_add_aoa(worksheet, header, { origin: "A1" });


        XLSX.utils.sheet_add_aoa(worksheet, [[
            "OrderID","Date","Customer","Email",
            "Product","Quantity","Price","Total",
            "Payment","Status"
        ]], { origin: "A5" });

        const data = [];

        orderList.forEach(order => {
            order.items.forEach(item => {
                data.push([
                    order.orderId,
                    formatDate(order.createdAt),
                    order.user?.name || "N/A",
                    order.user?.email || "",
                    item.productName,
                    item.quantity,
                    item.price,
                    item.total,
                    order.paymentMethod,
                    formatStatus(item.orderStatus)
                ]);
            });
        });

        XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });

        worksheet["!cols"] = [
            { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 25 },
            { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 18 }
        ];

        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }
        ];

        const titleStyle = {
            alignment: { horizontal: "center" },
            font: { bold: true, sz: 14 }
        };

        const subStyle = {
            alignment: { horizontal: "center" },
            font: { sz: 11 }
        };

        if (worksheet["A1"]) worksheet["A1"].s = titleStyle;
        if (worksheet["A2"]) worksheet["A2"].s = subStyle;
        if (worksheet["A3"]) worksheet["A3"].s = subStyle;

        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center" }
        };

        ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
            const cell = worksheet[col + "5"];
            if (cell) cell.s = headerStyle;
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

        const buffer = XLSXStyle.write(workbook, {
            type: "buffer",
            bookType: "xlsx"
        });

        res.setHeader("Content-Disposition", "attachment; filename=reports.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(buffer);

    } catch (err) {
        console.log(err);
        res.status(500).send("Excel Error");
    }
};


export const exportPDF = async (req, res) => {
    try {

        const search = req.query.search || "";
        const filter = req.query.filter || "all";
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;

        const { orderList } = await reportService(
            search, filter, 1, 100000, startDate, endDate
        );

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reports.pdf");

        doc.pipe(res);

        const formatDate = (date) =>
            new Date(date).toLocaleDateString("en-GB");

        const today = new Date();

        let from = null;
        let to = formatDate(today);



        if (filter === "week") {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            from = formatDate(start);
        }
        else if (filter === "month") {
            from = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        }
        else if (filter === "year") {
            from = formatDate(new Date(today.getFullYear(), 0, 1));
        }
        else if (filter === "custom" && startDate && endDate) {
            from = formatDate(startDate);
            to = formatDate(endDate);
        }
        else if (filter === "all" && orderList.length > 0) {
            const firstOrder = orderList[orderList.length - 1];
            from = formatDate(firstOrder.createdAt);
        }


        doc.fontSize(16).text("Sales Report", { align: "center" });
        doc.moveDown(0.5);

        doc.fontSize(10)
            .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });

        if (
            filter === "all" || 
            filter === "week" ||
            filter === "month" ||
            filter === "year" ||
            (filter === "custom" && startDate && endDate)
        ) {
            doc.text(`Period: ${from} to ${to}`, { align: "center" });
        }

        doc.moveDown();

        let y = doc.y;

        const startX = 40;

        const cols = {
            order: startX,
            date: startX + 80,
            customer: startX + 140,
            product: startX + 230,
            qty: startX + 370,
            total: startX + 400,
            status: startX + 460
        };

        doc.font("Helvetica-Bold").fontSize(10);

        doc.text("OrderID", cols.order, y);
        doc.text("Date", cols.date, y);
        doc.text("Customer", cols.customer, y);
        doc.text("Product", cols.product, y);
        doc.text("Qty", cols.qty, y);
        doc.text("Total", cols.total, y);
        doc.text("Status", cols.status, y);

        y += 15;
        doc.moveTo(startX, y).lineTo(startX + 500, y).stroke();

        y += 5;
        doc.font("Helvetica").fontSize(9);

        orderList.forEach(order => {
            order.items.forEach(item => {

                const status = item.orderStatus
                    ?.replaceAll("_", " ")
                    .replace(/\b\w/g, c => c.toUpperCase());

                doc.text(order.orderId, cols.order, y);
                doc.text(formatDate(order.createdAt), cols.date, y);
                doc.text(order.user?.name || "N/A", cols.customer, y);
                doc.text(item.productName.substring(0, 25), cols.product, y);
                doc.text(item.quantity.toString(), cols.qty, y);
                doc.text(item.total.toString(), cols.total, y);
                doc.text(status, cols.status, y);

                y += 18;

                if (y > 750) {
                    doc.addPage();
                    y = 40;
                }
            });
        });

        doc.end();

    } catch (err) {
        console.log(err);
        res.status(500).send("PDF Error");
    }
};

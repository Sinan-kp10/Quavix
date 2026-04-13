
import XLSX from "xlsx";
import XLSXStyle from "xlsx-style";
import PDFDocument from "pdfkit";




import {
    adminLoginAccess,
    getAllUsers,
    allBlockedUser,
    allActiveUsers,
    getAllCategory,
    createCategory,
    deleteCategory,
    updateCategory,
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

export const blockedUsers = async (req, res) => {
    try {
        const user = await allBlockedUser(req.params.id);
        res.json({ success: true, status: user.status });
    } catch (err) {
        res.json({ success: false, message:err.message });
    }
}

export const activeUsers = async (req, res) => {
    try {
        const user = await allActiveUsers(req.params.id);
        res.json({ success: true, status: user.status });
    } catch (err) {
        res.json({ success: false ,message:err.message });
    }
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
}

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

        let flattenedItems = []

        orderList.forEach(order => {
            order.items.forEach(item => {
                flattenedItems.push({
                    _id: order._id,
                    orderId: order.orderId,
                    createdAt: order.createdAt,
                    user: order.user,
                    paymentMethod: order.paymentMethod,
                    subtotal: order.subtotal,
                    couponDiscount: order.couponDiscount,
                    totalAmount: order.totalAmount,
                    items: item
                })
            })
        })


        res.render("admin/reports",{ 
            title: "Sales and Reports -Quavix",
            css: "adminStyle",
            order:flattenedItems,
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

                let finalItemTotal = item.total;
                if(order.couponDiscount && order.subtotal > 0){
                    const itemShare = item.total / order.subtotal;
                    const couponShare = order.couponDiscount * itemShare;
                    finalItemTotal = Math.round(item.total - couponShare);
                }

                data.push([
                    order.orderId,
                    formatDate(order.createdAt),
                    order.user?.name || "N/A",
                    order.user?.email || "",
                    item.productName,
                    item.quantity,
                    item.price,
                    finalItemTotal,
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
}


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

                let finalItemTotal = item.total;
                if(order.couponDiscount && order.subtotal > 0){
                    const itemShare = item.total / order.subtotal;
                    const couponShare = order.couponDiscount * itemShare;
                    finalItemTotal = Math.round(item.total - couponShare);
                }

                doc.text(order.orderId, cols.order, y);
                doc.text(formatDate(order.createdAt), cols.date, y);
                doc.text(order.user?.name || "N/A", cols.customer, y);
                doc.text(item.productName.substring(0, 25), cols.product, y);
                doc.text(item.quantity.toString(), cols.qty, y);
                doc.text(finalItemTotal.toString(), cols.total, y);
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
}

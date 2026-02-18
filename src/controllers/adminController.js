import {
    adminLoginAccess,
    getAllUsers,
    allBlockedUser,
    allActiveUsers
} from "../services/adminService.js"

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

export const loadDashboard=(req,res)=>{
    res.render("admin/dashboard",{ title: "Users Admin-Quavix",css: "adminStyle" })
}

export const adminLogout=(req,res)=>{
    req.session.admin=null
    res.redirect("/admin/login")
}
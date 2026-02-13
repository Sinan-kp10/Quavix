export const loadLogin=(req,res)=>{
    res.render("admin/login",{ title: "Login Admin-Quavix",css: "adminStyle" })
}
export const loadUsers=(req,res)=>{
    res.render("admin/users",{ title: "Users Admin-Quavix",css: "adminStyle" })
}
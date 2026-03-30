export const isLogin=(req,res,next)=>{
    if(!req.session.admin) {
        return res.redirect("/admin/login");
    }
    next();
};

export const checkSession =(req, res, next)=>{
    if(req.session.admin){
        return res.redirect("/admin/dashboard");
    }
    next();
}

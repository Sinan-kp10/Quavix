import users from "../models/userModal.js"
export const isLogin = async(req, res, next) => {

    try {
        if(!req.session.user){
        return res.redirect("/login");
    }
    
    const user=await users.findById(req.session.user.id)


    if(!user||user.status==="blocked"){
        req.session.destroy()
        return res.redirect("/login")
    }

    next()

    }catch(error) {
        console.log(error)
    }
}


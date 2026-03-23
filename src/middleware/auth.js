import users from "../models/userModal.js"
export const isLogin = async(req, res, next) => {

    try {
        if(!req.session.user){

            if (req.headers["content-type"] === "application/json") {
                return res.status(401).json({
                    success: false,
                    loginRequired: true,
                   
                });
            }
        return res.redirect("/login");
    }
    
    const user=await users.findById(req.session.user.id)


    if(!user||user.status==="blocked"){
        delete req.session.user
        return res.redirect("/login")
    }

    next()

    }catch(error) {
        console.log(error)
    }
}


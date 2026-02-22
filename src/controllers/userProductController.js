import userModal from "../models/userModal.js"





export const loadShop=async(req,res)=>{
    try {

        res.render("user/shop",{title:"products-Quavix",css: "userStyle"})
        
    }catch(err){
        console.log(err)
    }
}

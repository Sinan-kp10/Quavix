import cartModel from "../../models/cartModel.js"
import wishlistModel from "../../models/wishlistModel.js";

export const cartCountMiddleware = async (req, res, next) => {

    if (!req.session.user) {
        res.locals.cartCount = 0;
        return next();
    }

    const cart = await cartModel.findOne({ user: req.session.user.id });

    let count = 0;

    if (cart) {
        cart.items.forEach(item => {
            count += item.quantity;
        });
    }

    res.locals.cartCount = count;

    next();
}

export const wishlistCountMiddleware =async(req,res,next)=>{
    if (!req.session.user) {
        res.locals.wishlistCount = 0;
        return next();
    }

    const wishlist = await wishlistModel.findOne({ user: req.session.user.id });
    let count = 0;

    if (wishlist) {
        wishlist.items.forEach(item => {
            count ++;
        })
    }

    res.locals.wishlistCount = count;

    next();
}
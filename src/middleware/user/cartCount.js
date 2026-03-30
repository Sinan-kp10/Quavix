import cartModel from "../../models/cartModel.js"

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
};
export const toastMiddleware=(req, res, next)=>{

    if(req.session.toastMessage){
        res.locals.toastMessage = req.session.toastMessage;
        res.locals.toastType = req.session.toastType;

        
        delete req.session.toastMessage;
        delete req.session.toastType;
    }

    next();
};

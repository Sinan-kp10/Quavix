import users from "../models/userModal.js"

export const googleUserStatus = async (req, res, next) => {
  try {

    if(!req.user){
      return res.redirect("/login");
    }

    const user = await users.findById(req.user.id);



    if (!user || user.status==="blocked") {
      req.session.toastMessage = "Your account has been blocked by administrator"
      req.session.toastType = "error";
      return res.redirect("/login");
    }

    next()

  } catch (error) {
    console.log(error);
    return res.redirect("/login")
  }
};

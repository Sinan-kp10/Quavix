import multer from "multer";
import upload from "../config/multer.js";

export const profileUploadValidation = (req, res, next) => {

   const runMulter=upload.single("profileImage")
   runMulter(req, res, function (err) {

    if (err instanceof multer.MulterError) {
      req.session.toastMessage = "File too large. Max size is 2MB.";
      req.session.toastType = "error";
      return res.redirect("/profile");
    }

    if (err) {
      req.session.toastMessage = err.message;
      req.session.toastType = "error";
      return res.redirect("/profile");
    }

    if (!req.file) {
      req.session.toastMessage = "Please select an image.";
      req.session.toastType = "error";
      return res.redirect("/profile");
    }

    next();
  })

}
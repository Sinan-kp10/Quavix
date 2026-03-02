import multer from "multer";
import upload from "../config/multer.js";

export const profileUploadValidation = (req, res, next) => {

   const runMulter=upload.single("profileImage")
   runMulter(req, res, function (err) {

    if(err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: "File too large. Max size is 2MB." });
    }

    if(err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if(!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image." });
    }

    next();
  })

}
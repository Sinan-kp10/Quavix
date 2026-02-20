import multer from "multer"

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only JPG, PNG, WEBP images are allowed"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 
    },
    fileFilter
});

export default upload

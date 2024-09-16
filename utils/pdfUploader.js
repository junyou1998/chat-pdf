import multer from "multer";
import path from "path";

// Multer 用於處理文件上傳
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const fullFileName = Date.now() + path.extname(file.originalname);
        cb(null, fullFileName);
    },
});

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("只允許上傳 PDF 文件!"), false);
        }
    },
});

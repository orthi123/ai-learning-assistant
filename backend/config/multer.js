//file upload middleware----save in a folder of server -----
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

//ES modeule e direct file er direction thake na tai------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//file koi save hocche shei path thik kore-----------
const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });//folder na thakle banay-------
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter - only PDFs(Security check)----------
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); //cb- callback
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// upload object e rakha hocche-----------
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default file size (limited)
  }
});
export default upload;
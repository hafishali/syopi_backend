const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userType = req.body.userType; 
    const fileType = req.body.fileType; 


    if (!userType || !fileType) {
      return cb(new Error("UserType and FileType are required!"), false);
    }

    const folderPath = path.join(__dirname, "../uploads", userType, fileType);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath); // Callback with the folder path
  },
  filename: (req, file, callback) => {
    const filename = `image-${Date.now()}-${file.originalname}`;
    callback(null, filename);
  },
});

// Filter for valid image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed!"), false);
  }
};

// Setup Multer with storage and filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limit file size to 3MB
});

module.exports = upload;

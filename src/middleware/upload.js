const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const dirs = [
    './uploads',
    './uploads/profiles',
    './uploads/products',
    './uploads/categories',
    './uploads/brands'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create directories on startup
createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './uploads';
    
    // Determine the destination folder based on the route or file type
    if (req.baseUrl.includes('/users') || req.originalUrl.includes('/profile')) {
      uploadPath = './uploads/profiles';
    } else if (req.baseUrl.includes('/products')) {
      uploadPath = './uploads/products';
    } else if (req.baseUrl.includes('/categories')) {
      uploadPath = './uploads/categories';
    } else if (req.baseUrl.includes('/brands')) {
      uploadPath = './uploads/brands';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max size
  },
  fileFilter: fileFilter
});

module.exports = upload; 
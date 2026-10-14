const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb, req) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Specific restrictions for Promotion Uploads
  if (req && req.query && req.query.type === 'promotion') {
    const isVideo = req.query.mediaType === 'video';
    
    if (isVideo) {
      if (['.mp4', '.webp'].includes(ext)) {
        return cb(null, true);
      } else {
        return cb(new Error('Only MP4 and WEBP video formats are allowed.'));
      }
    } else {
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        return cb(null, true);
      } else {
        return cb(new Error('Only JPG, JPEG, PNG and WEBP image formats are allowed.'));
      }
    }
  }

  // Fallback for general uploads
  const filetypes = /jpg|jpeg|png|webp|gif|mp4|webm/;
  const extname = filetypes.test(ext);
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and Videos only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb, req);
  },
});

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  
  // If the file is an image (jpg, jpeg, png) that we want to convert
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    try {
      const originalPath = req.file.path;
      // Change the extension to .webp for the new file
      const newFilename = req.file.filename.replace(new RegExp(`${ext}$`, 'i'), '.webp');
      const newPath = path.join(uploadDir, newFilename);

      await sharp(originalPath)
        .rotate()
        .webp({ quality: 85 })
        .toFile(newPath);

      // Delete the original uploaded file
      fs.unlinkSync(originalPath);

      // Return the new WebP URL
      return res.send({ url: `/uploads/${newFilename}` });
    } catch (error) {
      console.error('Error converting image to WebP:', error);
      return res.status(500).send({ message: 'Error processing image format.' });
    }
  }

  // Return the original URL path if it's already webp, video, etc.
  res.send({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;

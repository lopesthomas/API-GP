const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const path = require("path");
const { error } = require("console");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // file.filename.replace("");
    const name = file.originalname
      .split(" ")
      .join("_")
      .split("." + MIME_TYPES[file.mimetype])
      .join("_");
    console.log(name);
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
    console.log(name);
  },
});

const multerUpload = multer({ storage: storage }).single("image");
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  try {
    const resizedImagePath = req.file.path.replace(
      /\.(jpg|jpeg|png)$/i,
      "_resized.$1"
    );

    sharp(req.file.path)
      .resize(300, 600, {
        kernel: sharp.kernel.nearest,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      })
      .toFile(resizedImagePath);
    console.log("L'image a été redimensione");
    setTimeout(() => {
      fs.unlinkSync(req.file.path); // Supprime l'image originale
    }, 3000);
    // req.file.path = resizedImagePath;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur de traitement d'image." });
  }
};

module.exports = { multerUpload, resizeImage };

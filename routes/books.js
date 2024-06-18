const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const controller = require("../controllers/books");

const router = express.Router();

router.get("/", controller.allInfoBook);
router.get("/bestrating", controller.threeBest);
router.get("/:id", controller.findOneBook);

router.post(
  "/",
  auth,
  multer.multerUpload,
  multer.resizeImage,
  controller.addBook
);
router.put(
  "/:id",
  auth,
  multer.multerUpload,
  multer.resizeImage,
  controller.modifyBook
);
router.delete("/:id", auth, controller.deleteBook);
router.post("/:id/rating", controller.rateBook);

module.exports = router;

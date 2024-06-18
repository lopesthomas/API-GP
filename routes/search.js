const express = require("express");
const controller = require("../controllers/search");

const router = express.Router();

router.get("/", controller.allSearch);
router.get("/regions", controller.allRegions);
router.get("/categorys", controller.allCategorys);
//router.post("/login", controller.logUser);






module.exports = router;

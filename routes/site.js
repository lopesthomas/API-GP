const express = require("express");
const controller = require("../controllers/site");

const router = express.Router();

router.get("/", controller.allSite);
//router.post("/login", controller.logUser);






module.exports = router;

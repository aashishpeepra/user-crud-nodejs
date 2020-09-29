const express = require("express");

const userControllers = require("../controllers/user-controllers");

const router = express.Router();

router.post("/login", userControllers.login);

router.post("/signup", userControllers.signup);

router.post("/reset_password", userControllers.postResetData);

router.post("/new_password", userControllers.createNewPassword);

module.exports = router;
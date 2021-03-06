const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controllers");

const router = express.Router();

router.post("/login", userControllers.login);

router.post(
  "/signup",
  [
    check("name").isLength({ min: 3, max: 20 }),
    check("email").isEmail(),
    check("password").isLength({ min: 8 }),
    check("github").isLength({ min: 3 }),
    check("role").notEmpty(),
  ],
  userControllers.signup
);

router.post(
  "/resetpassword",
  [check("email").isEmail()],
  userControllers.postResetData
);

router.post(
  "/newpassword/:id",
  check("password").isLength({ min: 8 }),
  userControllers.createNewPassword
);

module.exports = router;

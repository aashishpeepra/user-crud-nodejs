const User = require("../models/user");
const HttpError = require("../models/http-error");

exports.signup = async (req, res, next) => {};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Server Error", 501);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Invalid Credentials, please try again.", 404);
    return next(error);
  }
  
  res.send(existingUser);
  
};

exports.postResetData = async (req, res, next) => {};

exports.createNewPassword = async (req, res, next) => {};

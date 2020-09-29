const User = require("../models/user");
const HttpError = require("../models/http-error");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mailgun = require("mailgun-js")({
  apiKey: process.env.API_KEY,
  domain: process.env.DOMAIN,
});
const {randomString} = require("../utils/random-generator");

exports.signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new HttpError("Invalid Data Pased", 300);
    return next(error);
  } else {
    const { name, email, password, github, role } = req.body;
    let userExists = false;
    try {
      userExists = await User.findOne({ email: email });
    } catch (err) {
      return next(new HttpError("Can't connect to database", 500));
    }
    if (userExists) return next(new HttpError("User Already exists", 400));

    // encrpyting password using bcrypt

    bcrypt.hash(password, parseInt(process.env.ROUNDS), function (err, hash) {
      if (err) return next(new HttpError("Can't connect to database", 500));

      let newUser = new User({
        name,
        email,
        password: hash,
        github,
        role,
      });

      newUser
        .save()
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          return next(new HttpError("Can't connect to database", 500));
        });
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Server Error", 501);
    return next(error);
  }

  if (existingUser == null) {
    const error = new HttpError("Invalid Credentials, please try again.", 400);
    return next(error);
  }

  // brcypt by adarsh srivastava to unhash the password
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Server error, please try again.", 500);
    return next(error);
  }

  if (!isValid) {
    const error = new HttpError("Wrong password, please try again.", 400);
    return next(error);
  }

  res.send(existingUser);
};

exports.postResetData = async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("Invalid Data Passed", 400));
  let existsEmail = false;
  try {
    existsEmail = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Can't connect to database", 500));
  }
  if (!existsEmail) return next(new HttpError("Email not found", 400));

  let token = randomString();
  // crypto.randomBytes(32, function (err, buffer) {
  //   if (err) return next(new HttpError("Backend Server Error", 500));
  //   token = buffer.toString("hex");
  // });
  existsEmail.resetToken = token;
  existsEmail.resetTokenExpiryDate = Date.now() + 36000;
  console.log(token, existsEmail, email);
  try {
    await existsEmail.save();
  } catch (err) {
    return next(new HttpError("Backend Server Error", 500));
  }
  //creating mail body
  const data = {
    from: "postmaster@sandboxcdfdfb48ad9c467385bfb5b1d4d558fb.mailgun.org",
    to: existsEmail.email,
    subject: "Reset Your password at localhost",
    html: `<h1>Hola! ${
      existsEmail.name
    } </h1><h3>Follow the link given below </h3><a href="http://localhost:3000/newpassword/${existsEmail.email}?q=${token}}">
      http://localhost:3000/newpassword/${
      existsEmail.email + "?q=" + token
    }</a>`,
  };
  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
  res.send({ message: "Request Send Successfully" });
};

exports.createNewPassword = async (req, res, next) => {
  const email = req.params.id;
  const token = req.query.q;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("Password IsValid", 400));
  let userToModify;
  console.log(email,token)
  try {
    userToModify = await User.findOne({
      email: email,
      
    });
  } catch (err) {
    return next(new HttpError("Backend Error", 500));
  }

  // checking timestamp
  if (!userToModify) return next(new HttpError("Invalid Credentials", 400));
  if( userToModify.resetTokenExpiryDate<Date.now() && userToModify.resetToken!==token)
  return next(new HttpError("Invalid Credentials", 400));
  const { password } = req.body;
  bcrypt.hash(password, parseInt(process.env.ROUNDS), function (err, hash) {
    if (err) return next(new HttpError("Backend Error", 500));
    userToModify.password = hash;
    userToModify.resetToken = randomString()
    userToModify
      .save()
      .then((response) => {
        res.send({ message: "Succefful" });
      })
      .catch((err) => {
        return next(new HttpError("Backend Error", 500));
      });
  });
};

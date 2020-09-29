const User = require("../models/user");
const HttpError = require("../models/http-error");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

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

    bcrypt.hash(password,parseInt(process.env.ROUNDS),function(err,hash){

      if(err)
      return next(new HttpError("Can't connect to database", 500));
      
      let newUser= new User({
        name,
        email,
        password:hash,
        github,
        role
      })
 
        newUser.save().then(response=>{
          res.send(response)
        })
        .catch(err=>{
          return next(new HttpError("Can't connect to database", 500));
        })
    })
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Server Error", 501);
    return next(error);
  }

  if (!existingUser) {
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

  if(!isValid) {
    const error = new HttpError("Wrong password, please try again.", 400);
    return next(error);
  }

  res.send(existingUser);
};

exports.postResetData = async (req, res, next) => {};

exports.createNewPassword = async (req, res, next) => {};

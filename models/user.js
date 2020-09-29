const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    required:true,
    default:"user"
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  github: {
    type: String,
    required: true,
    unique: true,
  },
  resetToken: {
    type: String,
    default: undefined,
  },
  resetTokenExpiryDate: {
    type: Date,
    default: undefined,
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);

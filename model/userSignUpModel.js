const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSignUpSchema = new Schema({
  userSignFullName: { type: String, required: true },
  userSignEmail: { type: String, required: true},
  userSignPassword: { type: String, required: true },
  userSignConfirmPassword: { type: String, required: true },
  userSignMobileNo: { type: Number, required: true }
});

module.exports = mongoose.model("userSignUp", userSignUpSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const employerSignUpSchema = new Schema({
  employerSignName: { type: String, require: true },
  employerSignCompanyName: { type: String, require: true },
  designation: { type: String, require: true },
  noOfEmployees: { type: Number, require: true },
  employerSignEmail: { type: String, require: true },
  employerSignPassword: { type: String, require: true },
  employerSignConfirmPassword: { type: String, require: true },
  employerSignMobileNo: { type: Number, require: true },
});

module.exports = mongoose.model("employerSignUp", employerSignUpSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const JobPostingSchema = new Schema({
  jobPosts: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      companyName:{ type: String, required: true },
      noOfEmployers:{type:Number, required: true },
      companyIndustry: { type: String, required: true },
      companyDescription: { type: String, required: true },
      jobTitle: { type: String, required: true },
      JobOption: { type: String, required: true },
      jobCity: { type: String, required: true },
      jobArea: { type: String, required: true },
      jobPincode: { type: Number, required: true },
      jobStreet: { type: String, required: true },
      jobType: [{ type: String, required: true }],
      jobSchedule: [{ type: String, required: true }],
      jobMinValue: { type: Number, required: true },
      jobMaxValue: { type: Number, required: true },
      jobRate: { type: String, required: true },
      jobSkill: {type: String, required: true},
      isActive: {type: Boolean, required:false},
      timeStamp:{type: Date, required:false}
    },
  ],
});

module.exports = mongoose.model("JobPostData", JobPostingSchema);

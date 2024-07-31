const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExperienceSchema = new Schema({
    experienceJobTitle: { type: String, required: false },
    experienceCompany: { type: String, required: false },
    experienceYear: { type: String, required: true }
  });
  
  const EducationSchema = new Schema({
    course: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
  });

const AppliedSchemaModel = new Schema({
    applyId: {type: mongoose.Schema.Types.ObjectId,require: true},
    applyCompanyName: {type: String, require:true},
    applyJobTitle: {type: String, require:true},
    applyFullName: {type: String, require:true},
    applyEmail: {type: String, require:true},
    applyMobileNo: {type: Number, require:true},
    applyResume: {type: String, require:true},
    applyExperience: {type: [ExperienceSchema], require:false},
    applyEducation: {type:[EducationSchema], require:true},
    applySkills: {type: [String], require:true},
    applyLanguages: {type: [String], require:true},
    jobApplied: {type:Boolean, require:true},
    preferred: {type:String, require:false},
    viewed:{type:String, require:false},
    timeStamp:{type:Date,require:false}
})

module.exports = mongoose.model('AppliedData', AppliedSchemaModel)
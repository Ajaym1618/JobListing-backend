const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExperienceSchema = new Schema({
    experienceJobTitle: { type: String,require:false },
    experienceCompany: { type: String, require:false},
    experienceYear : { type: String, required: true }
});

const EducationSchema = new Schema({
    course: { type: String, required: true },
    fieldOfStudy: { type: String, required: true }
});

const QualificationSchema = new Schema({
    qualifyId:{ type: mongoose.Schema.Types.ObjectId,required: true},
    experience: { type: [ExperienceSchema], require:false},
    education: { type: [EducationSchema], required: true },
    skills: { type: [String], required: true },
    languages: { type: [String], required: true }
});

module.exports = mongoose.model('Qualification', QualificationSchema);

 

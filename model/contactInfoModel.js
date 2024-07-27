const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    contactId: {type:String},
    contactFullName: {type:String, require:true},
    contactEmail: {type:String, require:true},
    contactPhoneNo: {type:Number, require:true},
    resume: {type:String, require:true},
    contactCountry:{type:String, require:true},
    contactStreet: {type:String, require:true},
    contactCity: {type:String, require:true},
    contactPincode: {type:String, require:true},
})

module.exports = mongoose.model("ContactInfo", ContactSchema);
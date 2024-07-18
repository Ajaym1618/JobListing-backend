const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const bookmark = new Schema({
    bookmarkId: String
})

module.exports = mongoose.model("bookmark", bookmark)
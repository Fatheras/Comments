var mongoose = require("mongoose");
var userCommentSchema = new mongoose.Schema({
  name: {type: String},
  comment:{type:String},
  avatar:{type:String},
});

var UserComment = mongoose.model( 'userComment', userCommentSchema );
module.exports = UserComment;

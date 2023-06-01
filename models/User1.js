const mongoose = require('mongoose');
const {Schema} = mongoose;

const User1Schema = new Schema({
  name: String,
  email: {type:String, unique:true},
  address: String,
  password: String,
});

const User1Model = mongoose.model('User1', User1Schema);

module.exports = User1Model;
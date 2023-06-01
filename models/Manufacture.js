const mongoose = require('mongoose');
const {Schema} = mongoose;

const ManufactureSchema = new Schema({
  Mname:String,
  Mid: String,
  to: String,
  from: String,
  address: String,
  quantity: String,
  transporter: String,
});

const ManufactureModel = mongoose.model('Manufacture', ManufactureSchema);

module.exports = ManufactureModel;
const mongoose = require('mongoose');
const {Schema} = mongoose;

const TransportSchema = new Schema({
  orderid: String,
  from: String,
  idman:String,
  amount: Number,
  message:String

});

const TransportModel = mongoose.model('Transport',TransportSchema);

module.exports = TransportModel;
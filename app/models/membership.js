var mongoose = require("mongoose");

//Admin Profile schema

var ModelSchema = mongoose.Schema({
  name: {
    type: String,
  },
  months: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    index: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  off: {
    type: Number,
    default: 0,
  },
  perMonth: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("membership", ModelSchema);

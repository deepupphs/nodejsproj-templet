var mongoose = require("mongoose");

//Admin Profile schema

var ModelSchema = mongoose.Schema({
  amount: {
    type: Number,
    default: 0,
  },
  dimonds: {
    type: Number,
    index: true,
  },
  currency: {
    type: String,
    default: "INR",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("recharge", ModelSchema);

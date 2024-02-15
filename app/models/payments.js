var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
//Admin Profile schema

var ModelSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    index: true,
  },
  orderDetails: {
    type: Object,
  },
  amount: {
    type: String,
    default: "",
  },
  dimonds: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("payment", ModelSchema);

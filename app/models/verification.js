var mongoose = require("mongoose");

//Admin Profile schema

var ModelSchema = mongoose.Schema({
  userId: {
    type: String,
    index: true,
  },
  secretCode: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("verification", ModelSchema);

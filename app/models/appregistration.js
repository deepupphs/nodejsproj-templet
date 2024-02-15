var mongoose = require("mongoose");

//schema

var ModelSchema = mongoose.Schema({
  userId: { type: String, index: true },
  reg_id: { type: String, index: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Modles---------------------------------------------------------------------------

module.exports.Model = mongoose.model("appregistration", ModelSchema);

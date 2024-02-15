var mongoose = require("mongoose");

var ModelSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  token: {
    type: String,
  },
  isLoggedIn: {
    type: Boolean,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("user_sessions", ModelSchema);

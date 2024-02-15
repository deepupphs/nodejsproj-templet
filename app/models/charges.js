var mongoose = require("mongoose");

//Admin Profile schema

var ModelSchema = mongoose.Schema({
  category: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  userSpend: {
    amount: {
      type: String,
    },
    type: {
      type: String,
      default: "dimonds",
    },
    duration: {
      type: String,
      default: "/min",
    },
  },
  hostReceive: {
    amount: {
      type: String,
    },
    type: {
      type: String,
      default: "points",
    },
    duration: {
      type: String,
      default: "/min",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("charge", ModelSchema);

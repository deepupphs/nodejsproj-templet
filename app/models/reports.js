var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
//Admin Profile schema

var ModelSchema = mongoose.Schema({
  agentId: {
    type: ObjectId,
    index: true,
  },
  hostId: {
    type: ObjectId,
    index: true,
  },
  hostUserId: {
    type: String,
    index: true,
  },
  hostUserName: {
    type: String,
  },
  date: {
    type: String,
  },
  earning: {
    type: Number,
  },
  liveDuration: {
    type: Number,
  },
  callDuration: {
    type: Number,
  },
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("report", ModelSchema);

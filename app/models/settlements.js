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
  settlementDate: {
    type: Date,
  },
  cycle: {
    fromDate: {
      type: Date,
    },
    toDate: {
      type: Date,
    },
  },
  totalEarning: {
    type: Number,
  },
  walletBalanceBefore: {
    type: Number,
  },
  accumulatedAmount: {
    type: Number,
  },
  commission: {
    type: Number,
  },
  commissionRatio: {
    type: Number,
  },
  cashOut: {
    type: Number,
  },
  walletBalanceAfter: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("settlement", ModelSchema);

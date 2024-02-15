let mongoose = require("mongoose");
let Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

let ModelSchema = new Schema({
  user: {
    type: ObjectId,
    ref: "Users",
  },
  followers: [
    {
      type: ObjectId,
      ref: "Users",
    },
  ],
  following: [
    {
      type: ObjectId,
      ref: "Users",
    },
  ],
});

//module.exports = mongoose.model('Follow', FollowSchema);

module.exports.Model = mongoose.model("Follow", ModelSchema);

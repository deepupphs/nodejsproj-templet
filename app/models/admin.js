var mongoose = require("mongoose");

//Admin Profile schema

var ModelSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    default: "",
  },

  password: {
    type: String,
    required: true,
    index: true,
  },

  role: {
    type: String,
    default: "ADMIN",
  },

  adminImage: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// let data = {

//   role: "ADMIN",
//   adminImage: "",
//   name: "Rajesh",
//   emailId: "admin@golo.com",
//   password: "07fd92a317ff1f3e70d63e767af3a537"

// };

//------------------------------------------Model---------------------------------------------------------------------------
module.exports.Model = mongoose.model("admin", ModelSchema);

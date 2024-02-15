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
  contactNumber: {
    //body
    type: String,
    index: true,
    validate: {
      validator: function (v) {
        return /^(\+|\d)+(\s)[0-9]{3,14}$/.test(v);
      },
      message: "{VALUE} is not a valid phone number!",
    },
    //validate: /^(\+|\d)+(\s)[0-9]{3,14}$/,
  },

  password: {
    type: String,
    required: true,
    index: true,
  },

  role: {
    type: String,
    default: "AGENCY",
  },

  image: {
    type: String,
    default: "",
  },
  address: {
    //body
    type: String,
    default: "",
  },
  city: {
    //body
    type: String,
    default: "",
  },
  state: {
    //body
    type: String,
    default: "",
  },
  zip: {
    //body
    type: String,
    default: "",
  },
  status: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
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
module.exports.Model = mongoose.model("agency", ModelSchema);

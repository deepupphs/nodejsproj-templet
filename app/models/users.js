const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
//https://docs.mongodb.com/manual/reference/operator/query/near/
//https://stackoverflow.com/questions/43823142/mongodb-find-near-users-point-with-distance
// schema maps to a collection
const Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
    index: "2d",
  },
});

const ModelSchema = new Schema({
  gender: {
    //body
    type: Boolean,
    index: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  agencyId: {
    //body
    type: ObjectId,
    index: true,
    default: null,
  },
  userName: {
    //body
    type: String,
    index: true,
    unique: true,
  },
  dob: {
    //body
    type: String,
    default: "",
  },
  userID: {
    //body
    type: String,
  },
  userImage: {
    //body
    type: String,
    default: "",
  },
  normalPics: {
    type: [String],
    default: [],
  },
  secretPics: {
    type: [String],
    default: [],
  },
  pointOfInterest: {
    type: [String],
    default: [],
  },
  savedProfiles: {
    type: [String],
    default: [],
  },
  relationShipStatus: {
    // single - 0/ married -1/ divorcee -3/ widow -4
    type: Number,
  },
  height: {
    //body
    type: String,
    default: "",
  },
  weight: {
    //body
    type: String,
    default: "",
  },
  profession: {
    //body
    type: String,
    default: "",
  },
  greetings: {
    text: {
      type: String,
      default: "",
    },
    audio: {
      type: String,
      default: "",
    },
  },
  // location: {
  //   //body
  //   type: pointSchema,
  // },
  location: {
    type: [Number],
    index: "2d",
  },
  // location: {
  //   type: { type: String, default: "['Point']" },
  //   coordinates: {
  //     type: Array,
  //     default: [],
  //   },

  // },
  // location: {
  //   type: {
  //     type: String, // Don't do `{ location: { type: String } }`
  //     enum: ["Point"], // 'location.type' must be 'Point'
  //   },
  //   coordinates: {
  //     type: [Number],
  //   },
  // },

  host: {
    type: Boolean,
    default: false,
  },
  wallet: {
    amount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: "dimonds",
    },
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

  name: {
    //body
    type: String,
  },
  emailId: {
    //body
    type: String,
    default: "",
    index: true,
  },
  contactNumber: {
    //body
    type: String,
    index: true,
    validate: {
      validator: function (v) {
        return /^(\+|\d)+(\s)[0-9]{3,14}$/.test(v);
      },
      message: "{VALUE} is not a valid phone number! use country code and space ex: '+91 9734545723'",
    },
    //validate: /^(\+|\d)+(\s)[0-9]{3,14}$/,
    
  },
  password: {
    //body
    type: String,

    index: true,
  },
  role: {
    type: String,
    default: "USER",
  },

  online: {
    type: Boolean,
    index: true,
    default: false,
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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  recommended: {
    type: Boolean,
    default: false,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});

//========Hiding important field and unwanted fields=======================

// ModelSchema.methods.toJSON = function () {
//   const user = this;
//   const userObject = user.toObject();

//   delete userObject.password;
//   delete userObject.__v;

//   return userObject;
// };

ModelSchema.index({ location: "2d" });
//ModelSchema.createIndex({ location: "2d" });

module.exports.Model = mongoose.model("Users", ModelSchema);

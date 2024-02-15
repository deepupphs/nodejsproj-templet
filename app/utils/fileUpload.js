// Load dependencies

const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

module.exports.userImageUpload = multer({
  storage: multer.diskStorage({
    destination: "./Uploads",
    filename: function (req, file, cb) {
      //console.log("am in function")
      return crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) {
          return cb(err);
        }
        let today = new Date().getTime();
        return cb(null, "" + "user-" + today + path.extname(file.originalname));
      });
    },
  }),
}).single("userImage");

module.exports.profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: "./Uploads",
    filename: function (req, file, cb) {
      //console.log("am in function")
      return crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) {
          return cb(err);
        }
        let today = new Date().getTime();
        const payload = req.decoded;
        //let phone = payload.contactNumber;
        //console.log("user phone==================", phone);
        return cb(
          null,
          "" + "-profile-" + today + path.extname(file.originalname)
        );
      });
    },
  }),
}).single("profile");

module.exports.greetingAudioUpload = multer({
  storage: multer.diskStorage({
    destination: "./Uploads",
    filename: function (req, file, cb) {
      //console.log("am in function")
      return crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) {
          return cb(err);
        }
        let today = new Date().getTime();
        const payload = req.decoded;
        //let phone = payload.contactNumber;
        //console.log("user phone==================", phone);
        return cb(
          null,
          "" + "-audio-" + today + path.extname(file.originalname)
        );
      });
    },
  }),
}).single("audio");

//Normal pics
let multipleNormalImageStorage = multer.diskStorage({
  destination: "./Uploads",
  filename: function (req, file, cb) {
    //console.log("am in function")
    return crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      let today = new Date().getTime();
      const payload = req.decoded;
      //let phone = payload.contactNumber;
      //console.log("user phone==================", phone);
      return cb(
        null,
        "" + "-userNormalPic-" + today + path.extname(file.originalname)
      );
    });
  },
});

var uploadNormalFiles = multer({ storage: multipleNormalImageStorage }).array(
  "userPhoto",
  5
);

module.exports.multipleNormalImageUpload = async (req, res, next) => {
  uploadNormalFiles(req, res, function (err) {
    console.log("in body" ,req.body);
    // console.log(req.files);
    if (err) {
      console.log(err);
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        console.log("Too many files to upload.");
        return res.status(200).json({
          success: false,
          code: 200,
          message: `Only 5 images are allowed to upload`,
          data: {},
        });
      }
    }
    next();
  });
};

//Secret pics
let multipleSecretImageUpload = multer.diskStorage({
  destination: "./Uploads",
  filename: function (req, file, cb) {
    //console.log("am in function")
    return crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      let today = new Date().getTime();
      const payload = req.decoded;
      //let phone = payload.contactNumber;
      //console.log("user phone==================", phone);
      return cb(
        null,
        "" + "-userSecretPic-" + today + path.extname(file.originalname)
      );
    });
  },
});

var uploadSecretFiles = multer({ storage: multipleSecretImageUpload }).array(
  "userSecretPhoto",
  5
);

module.exports.multipleSecretImageUpload = async (req, res, next) => {
  uploadSecretFiles(req, res, function (err) {
    //console.log(req.body);
    //console.log(req.files);
    if (err) {
      console.log(err);
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        console.log("Too many files to upload.");
        return res.status(200).json({
          success: false,
          code: 200,
          message: `Only 5 images are allowed to upload`,
          data: {},
        });
      }
    }
    next();
  });
};

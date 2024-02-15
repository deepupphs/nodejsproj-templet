const jwt = require("jsonwebtoken");
const config = require("../../config");

module.exports = {
  generateUserToken: (payload) => {
    try {
      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 * 365 * 25,
        //expiresIn: '1h',
      });
      return token;
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      console.log(err);
      return err;
      // return res.status(500).json({
      //   success: false,
      //   data: {
      //     msg: err.message,
      //     results: null,
      //   },
      // });
    }
  },
};

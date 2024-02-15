var stage = require("../../config");
const logger = require("../handlers/logHandlers");
var crypto = require("crypto");

module.exports = {
  passwordEncryption: async (password) => {
    let myPass = password;

    if (myPass) {
      try {
        const algorithm = "aes-192-cbc";
        const secret = stage.JWT_SECRET;
        // Use the async `crypto.scrypt()` instead.
        const key = crypto.scryptSync(secret, "salt", 24);
        // Use `crypto.randomBytes` to generate a random iv instead of the static iv
        // shown here.
        const iv = Buffer.alloc(16, 0); // Initialization vector.

        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(myPass, "utf8", "hex");
        encrypted += cipher.final("hex");

        return encrypted;
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        let result = {};
        logger.error("Password encryption error : ", err);

        result.success = false;
        let status = 500;
        result.code = 500;
        result.message = err.message;
        result.data = null;
        return res.status(status).send(result);
      }
    } else {
      result.success = false;
      let status = 200;
      result.code = 200;
      result.message = "Please enter the password";
      result.data = null;
      return res.status(status).send(result);
    }
  },
};

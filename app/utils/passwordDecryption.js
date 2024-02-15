let config = require("../../config");
const logger = require("../handlers/logHandlers");
let crypto = require("crypto");

module.exports = {
  passwordDecryption: async (ciphertext) => {
    try {
      const algorithm = "aes-192-cbc";
      const password = config.JWT_SECRET;
      // Use the async `crypto.scrypt()` instead.
      const key = crypto.scryptSync(password, "salt", 24);
      // The IV is usually passed along with the ciphertext.
      const iv = Buffer.alloc(16, 0); // Initialization vector.

      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      // Encrypted using same algorithm, key and iv.

      let decrypted = decipher.update(ciphertext, "hex", "utf8");
      decrypted += decipher.final("utf8");
      console.log("decrypted ", decrypted);
      return decrypted;
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      let result = {};
      logger.error("Password decryption error : ", err);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = err.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
};

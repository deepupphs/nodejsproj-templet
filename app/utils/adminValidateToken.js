const jwt = require("jsonwebtoken");

var stage = require("../../config");

module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(" ")[1]; // Bearer <token>

      try {
        // verify makes sure that the token hasn't expired and has been issued by us
        result = jwt.verify(token, stage.JWT_SECRET);

        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
      } catch (err) {
        console.log("Admin api err :", err);
        // Throw an error just in case anything goes wrong with verification
        res.status(403).json({
          success: false,
          data: {
            results: null,
            msg: "Authentication error. Invalid Token",
          },
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        data: {
          msg: `Authentication error. Token required.`,
          results: null,
        },
      });
    }
  },
};

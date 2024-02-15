const jwt = require("jsonwebtoken");
const config = require("../../config");
const utils = require("./index");
const mongoose = require("mongoose");
const usersSessionSchema = require("../models/user_sessions");

module.exports = {
  validateToken: async (req, res, next) => {
    //console.log(req.headers.authorization)
    const authorizationHeader = req.headers.authorization;
    //let result;
    if (authorizationHeader) {
      const token = req.headers.authorization.split(" ")[1]; // Bearer <token>

      try {
        // verify makes sure that the token hasn't expired and has been issued by us
        let result = await jwt.verify(token, config.JWT_SECRET);

        console.log("result ", result);

        let selected = "-__v";

        let isExpiredToken = false;
        let seconds = 1000;
        let d = new Date();
        let t = d.getTime();

        if (result.exp < Math.round(t / seconds)) {
          // code...
          console.log("token expired true");
          isExpiredToken = true;
        }

        if (isExpiredToken) {
          res.status(440).json({
            success: false,
            code: 440,
            message: "Token expired! Please login again",
            data: {},
          });
        } else {
          let squery = {
            user_id: result._id,
          };
          let userSessionModel = usersSessionSchema.Model;
          let usersSession = await userSessionModel.findOne(squery);
          //console.log("Checking user session", usersSession);
          if (usersSession) {
            if (usersSession.token === "") {
              //console.log("Token not present");
              res.status(440).json({
                success: false,
                code: 440,
                message: "Session expired! Please login again",
                data: {},
              });
            } else {
              // console.log("result._id ", result._id);
              // console.log("Token  present", usersSession);
              // Let's pass back the decoded token to the request object
              req.decoded = result;
              // We call next to pass execution to the subsequent middleware
              next();
            }
            // if (usersSession.isLoggedIn) {
            //   console.log("Multiple login attempt");
            //   res.status(440).json({
            //     success: false,
            //     code: 405,
            //     message:
            //       "Multiple login attempt\nUser already logged in from some other device,\nplease logout from that device or contact admin and try again",
            //     data: {},
            //   });
            // } else {
            //   if (usersSession.token === "") {
            //     //console.log("Token not present");
            //     res.status(440).json({
            //       success: false,
            //       code: 440,
            //       message: "Session expired! Please login again",
            //       data: {},
            //     });
            //   } else {
            //     // console.log("result._id ", result._id);
            //     // console.log("Token  present", usersSession);
            //     // Let's pass back the decoded token to the request object
            //     req.decoded = result;
            //     // We call next to pass execution to the subsequent middleware
            //     next();
            //   }
            // }
          } else {
            res.status(440).json({
              success: false,
              code: 440,
              message: "Session expired! Please login",
              data: {},
            });
          }
        }
      } catch (err) {
        console.log("Here 1", err.message);
        // Throw an error just in case anything goes wrong with verification
        res.status(403).json({
          success: false,
          code: 403,
          message: `Authentication error : ${err.message}`,
          data: {},
        });
      }
    } else {
      console.log("Here 2");
      return res.status(401).json({
        success: false,
        code: 401,
        message: `Authentication error. Token required.`,
        data: {},
      });
    }
  },
};

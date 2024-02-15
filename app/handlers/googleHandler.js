const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
var config = require("../../config");
const utils = require("../utils");
const logger = require("./logHandlers");

// module.exports = {
//   googlePassPort: async () => {
    
//     passport.use(new Strategy({
//       clientID: config.GOOGLE_CLIENT_ID,
//       clientSecret: config.GOOGLE_CLIENT_SECRET,
//       callbackURL: '/return'
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       console.log(profile._json)

//       return cb(null, profile._json);
//     }));
    
//     passport.serializeUser((user, cb) => {
//     cb(null, user);
//     });
    
//     passport.deserializeUser((obj, cb) => {
//     cb(null, obj);
//     });
//   }
// }

passport.use(new Strategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v1/users/google/callback'
},
async (accessToken, refreshToken, profile, done)  => {
  console.log(profile._json.email);
  //const ipInfo = req.ipInfo;
  
 console.log(profile._json);
let result = {};
  let emailId = profile._json.email;
 
    let query = {
      emailId: emailId,
    };
    let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
    //console.log(" --- user", user);
    if (user != null) {
     
         // Create a token
         const payload = {
          _id: user._id,
          name: user.name,
          userName: user.userName,
          emailId: user.emailId,
          contactNumber: user.contactNumber,
        };
        const token = await utils.GENERATE_TOKEN.generateUserToken(
          payload
        );
        // let userOnlineUpdateQuery = [
        //   {
        //     _id: user._id,
        //   },
        //   {
        //     $set: {
        //       online: true,
        //       location: {
        //         type: "Point",
        //         coordinates: JSON.parse(location),
        //       },
        //     },
        //   },
        //   {
        //     w: 1,
        //   },
        // ];

        // let usersOnlineUpdate = await utils.MODEL_ORM.update(
        //   utils.MODEL.users,
        //   userOnlineUpdateQuery
        // );

        //console.log("usersOnlineUpdate ", usersOnlineUpdate);

        //Create user session
        let userSessionQuery = {
          user_id: user._id,
        };

        let usersSession = await utils.MODEL_ORM.findOne(
          utils.MODEL.usersSession,
          userSessionQuery
        );

        if (usersSession) {
          let userSessionUpdateQuery = [
            {
              user_id: user._id,
            },
            {
              $set: {
                token: token,
              },
            },
            {
              w: 1,
            },
          ];

          let usersCreateSession = await utils.MODEL_ORM.update(
            utils.MODEL.usersSession,
            userSessionUpdateQuery
          );
        } else {
          let userSessionCreateQuery = {
            user_id: user._id,
            token: token,
          };

          let usersCreateSession = await utils.MODEL_ORM.create(
            utils.MODEL.usersSession,
            userSessionCreateQuery
          );
        }

        var userData = {
          user_id: user._id,
          name: user.name,
          userName: user.userName,
          emailId: user.emailId,
          contactNumber: user.contactNumber,
        };

        logger.info("User Login with email success");
        result.success = true;
        result.message = "Login success";
        result.token = token;
        let status = 200;
        result.data = userData;
        //console.log(result)
        done(null, result)
        //return res.status(status).send(result);
    } else {
      result.success = false;
      result.message = `User not found with this Email`;
      let status = 404;
      result.data = {};
      done(null, result)
      //return res.status(status).send(result);
    }
 
  
}));




module.exports = passport;


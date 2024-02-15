const utils = require("../utils");
const logger = require("../handlers/logHandlers");
const googleHandler = require("../handlers/googleHandler");
const facebookHandler = require("../handlers/faceBookHandler");
const Joi = require("@hapi/joi");
const fs = require("fs");
const path = require("path");
//const Joi = require("joi");
const config = require("../../config");
const {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("agora-access-token");

const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const admin = require("firebase-admin");
const moment = require("moment");
let mongoose = require("mongoose");
let ObjectId = mongoose.Types.ObjectId;
const userModel = require("../models/users");
const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: config.REZORPAY_KEY_ID,
  key_secret: config.REZORPAY_SECRET,
});

//push-notification-middle-ware-

async function pushnotify(registrationToken, payload, options) {
  return new Promise(async function (resolve, reject) {
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then(function (response) {
        console.log("Successfully sent notification:", response);

        if (response.results[0].error == undefined) {
          console.log("============================================= ");
          console.log("=======SENT PUSH NOTIFICATION TO USER======== ");
          console.log("============================================= ");
          resolve(true);
        } else {
          console.log("============================================= ");
          console.log(
            "Error while sending push notification ",
            response.results[0].error
          );
          console.log("============================================= ");
          resolve(false);
        }
      })
      .catch(function (error) {
        console.log("Error sending pushnotification:", error);
        resolve(false);
      });
  });
}

async function notify(payload) {
  return new Promise(async function (resolve, reject) {
    admin
      .messaging()
      .send(payload)
      .then(function (response) {
        console.log("Successfully sent notification:", response);
        console.log(response.results[0].error);
        console.log("============================================= ");
        console.log("=======SENT PUSH NOTIFICATION TO USER======== ");
        console.log("============================================= ");
        resolve(true);
      })
      .catch(function (error) {
        console.log("Error sending message:", error);
        resolve(false);
      });
  });
}

async function readHTMLFile(path) {
  return new Promise(async function (resolve, reject) {
    await fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
      //console.log("path ", path)
      if (err) {
        console.log("file read err : ", err);
        reject(false);
      } else {
        //console.log("html in file read ", html)
        resolve(html);
      }
    });
  });
}

function verifyEmail(link, email) {
  return new Promise(async function (resolve, reject) {
    let templatePath = "./emailTemplates/email_verification_templet.html";

    console.log("templatePath ", templatePath);

    let html = await readHTMLFile(templatePath);

    //console.log("html ", html)

    if (html == false) {
      reject(false);
    } else {
      let template = await handlebars.compile(html);
      let replacements = {
        link: link,
      };
      let htmlToSend = template(replacements);
      let mailOptions = {
        from: "support@golo.live",
        to: email,
        subject: "Golo-Email verivication ",
        html: htmlToSend,
      };

      let transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: {
          user: "support@golo.live",
          pass: "1re13ec153", //"1re13ec153", //Test@123
        },
        tls: {
          //ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
        debug: true, // show debug output
      });
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Error while sending email : ${error}`);
          logger.error(`Error while sending email : ${error}`);
          reject(false);
        } else {
          console.log(`Email sent for user with email : ${email}`);
          logger.info(`Email sent for user with email : ${email}`);
          resolve(true);
        }
      });
    }
  });
}

async function getRechargeDetails(amount, currency) {
  return new Promise(async function (resolve, reject) {
    let query = { amount: amount, currency: currency };

    let details = await utils.MODEL_ORM.findOne(utils.MODEL.recharge, query);
    if (details) {
      resolve(details);
    } else {
      resolve({
        amount: amount,
        dimonds: null,
        currency: currency,
      });
    }
  }).catch(function (error) {
    console.log("Error sending message:", error);
    resolve({
      amount: amount,
      dimonds: null,
      currency: currency,
    });
  });
}

module.exports = {
  //=============User signup =================
  signup: async (req, res) => {
    console.log("in body/form-data ", req.body);
    console.log("user image ", req.fileKey);
    //validation
    const schema = Joi.object().keys({
      //name: Joi.string().required(),
      userName: Joi.string().required(),
      gender: Joi.boolean().required(),
      //phoneVerified: Joi.boolean().required(),
      //emailId: Joi.string().email({ minDomainSegments: 2 }).required(),
      //contactNumber: Joi.string().required(),
      location: Joi.string().required(),
      //password: Joi.string().required(),
    });

    const checkDetails = {
      //name: req.body.name,
      userName: req.body.userName,
      gender: req.body.gender,
      //phoneVerified: req.body.phoneVerified,
      //emailId: req.body.emailId,
      //contactNumber: req.body.contactNumber,
      location: req.body.location,
      //password: req.body.password,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      console.log("value ", value);
      console.log("err ", err);

      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 422;
        result.code = 422;
        result.message = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        try {
          //destructuring
          let newUser = {};
          //newUser.name = req.body.name;

          //newUser.userName = req.body.userName;
          if (req.body.userName) {
            newUser.name = req.body.userName;
            newUser.userName = req.body.userName;
          }
          newUser.emailId = "";
          newUser.contactNumber = ""
          newUser.phoneVerified = false;
        
          if (req.body.emailId) {
            newUser.emailId = req.body.emailId;
          }
         
          if (req.body.contactNumber) {
            newUser.contactNumber = req.body.contactNumber;
          }
         

          if (req.body.phoneVerified) {
            if(req.body.phoneVerified === true || req.body.phoneVerified === "true"){
              newUser.phoneVerified = true;
            }
            
          }
          //newUser.emailId = req.body.emailId;
          //newUser.contactNumber = req.body.contactNumber;
          //newUser.agencyId = "";
          newUser.userImage = "";
          const fileKey = req.fileKey;

          if (fileKey != "") {
            newUser.userImage = fileKey;
          }

          //console.log("User image ", newUser.userImage);
          console.log("location ", req.body.location);
          let loc = JSON.parse(req.body.location);
          // newUser.location = {
          //   type: "Point",
          //   coordinates: loc.reverse(),
          // };

          newUser.location = loc;

         

          let epochId = Math.floor(new Date().getTime() / 1000.0);
          // if (req.body.gender === true) {
          //   newUser.userID = `F${epochId}`;
          //   newUser.role = "HOST";
          //   newUser.wallet = {
          //     amount: 0,
          //     type: "points",
          //   };
          // }

          // if (req.body.gender === false) {
          //   newUser.userID = `M${epochId}`;
          //   newUser.role = "USER";
          //   newUser.wallet = {
          //     amount: 0,
          //     type: "diamonds",
          //   };
          // }

          
          newUser.wallet = {
            amount: 0,
            type: "diamonds",
          };
         
          console.log("Gender ", req.body.gender);
          if (req.body.gender === true || req.body.gender === "true" || req.body.gender === 1) {
            newUser.userID = `F${epochId}`;
            newUser.role = "HOST";
            newUser.host = true;
            newUser.gender = true;
          } else{
            newUser.role = "USER";
            newUser.userID = `M${epochId}`;
            newUser.host = false;
            newUser.gender = false;
          }
          console.log("newUser.userID ", newUser.userID);

          if (req.body.dob) {
            newUser.dob = moment(req.body.dob).format("YYYY-MM-DD");
            console.log("newUser.dob ", newUser.dob);
          }
          if (req.body.relationShipStatus) {
            newUser.relationShipStatus = req.body.relationShipStatus;
          }
          if (req.body.height) {
            newUser.height = req.body.height;
          }
          if (req.body.weight) {
            newUser.weight = req.body.weight;
          }
          if (req.body.profession) {
            newUser.profession = req.body.profession;
          }
          if (req.body.greetingText) {
            newUser.greetings = {
              text: req.body.greetingText,
            };
          }
          if (req.body.address) {
            newUser.address = req.body.address;
          }
          if (req.body.city) {
            newUser.city = req.body.city;
          }
          if (req.body.state) {
            newUser.state = req.body.state;
          }
          if (req.body.zip) {
            newUser.zip = req.body.zip;
          }
          newUser.password = "";
          if (req.body.password) {
            newUser.password = await utils.ENCRYPTION.passwordEncryption(
              req.body.password
            );
          }
          let result = {};
          
          console.log("user details ======", newUser);
          console.log("====================================");


          if(req.body.contactNumber){
            let query = {
              contactNumber: req.body.contactNumber,
            };
            let userContactNumber = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query
            );

            if (userContactNumber != null) {
              result.success = false;
              let status = 200;
              result.code = 200;
              result.message = `Contact number already exists`;
              result.data = {
                contactNumber: req.body.contactNumber,
              };
              return res.status(status).send(result);
            } else {
              if (req.body.emailId) {
                let query = {
                  emailId: req.body.emailId,
                };
                let userEmail = await utils.MODEL_ORM.findOne(
                  utils.MODEL.users,
                  query
                );
                if (userEmail != null) {
                  result.success = false;
                  let status = 200;
                  result.code = 200;
                  result.message = `Email already exists`;
                  result.data = {
                    emailId: req.body.emailId,
                  };
                  return res.status(status).send(result);
                } else {
                  let query = {
                    userName: req.body.userName,
                  };
                  let userNameFound = await utils.MODEL_ORM.findOne(
                    utils.MODEL.users,
                    query
                  );
                  if (userNameFound != null) {
                    result.success = false;
                    let status = 200;
                    result.code = 200;
                    result.message = `User name already exists`;
                    result.data = {
                      userName: req.body.userName,
                    };
                    return res.status(status).send(result);
                  } else {
                    let user = await utils.MODEL_ORM.create(
                      utils.MODEL.users,
                      newUser
                    );
                    let userId = user._id;
                    if (user != null) {
                      console.log(
                        "==================== User created ========================"
                      );
                      let userDetails = await utils.MODEL_ORM.findOne(
                        utils.MODEL.users,
                        { _id: userId }
                      );
                      let payload = {
                        _id: userDetails._id,
                        userName: userDetails.userName,
                        name: userDetails.name,
                        //emailId: userDetails.emailId,
                        contactNumber: userDetails.contactNumber,
                      };
                      const token = await utils.GENERATE_TOKEN.generateUserToken(
                        payload
                      );
                      result.data = payload;
                      let userOnlineUpdateQuery = [
                        {
                          _id: user._id,
                        },
                        {
                          $set: {
                            online: true,
                          },
                        },
                        {
                          w: 1,
                        },
                      ];
                      let usersOnline = await utils.MODEL_ORM.update(
                        utils.MODEL.users,
                        userOnlineUpdateQuery
                      );
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
                              isLoggedIn: true,
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
                          isLoggedIn: true,
                        };
                        let usersCreateSession = await utils.MODEL_ORM.create(
                          utils.MODEL.usersSession,
                          userSessionCreateQuery
                        );
                      }
                      let mailSecret = await utils.ENCRYPTION.passwordEncryption(
                        req.body.emailId
                      );
                      let verificationQuery = {
                        userId: user._id,
                        secretCode: mailSecret,
                      };
                      let userEmailVrification = await utils.MODEL_ORM.create(
                        utils.MODEL.verification,
                        verificationQuery
                      );
                      console.log("userEmailVrification ", userEmailVrification);
                      let link = `${config.baseUrl}/${user._id}/${mailSecret}`;
                      if (req.body.emailId) {
                        let sendEmail = verifyEmail(link, userDetails.emailId);
                      }
  
                      let userData = {
                        user_id: userDetails._id,
                        name: userDetails.name,
                        // password: req.body.password,
                        gender: req.body.gender,
                        userName: userDetails.userName,
                        //emailId: userDetails.emailId,
                        contactNumber: userDetails.contactNumber,
                        userImage: userDetails.userImage,
                      };
                      logger.info("User Signup success");
                      result.success = true;
                      let status = 201;
                      result.code = 201;
                      result.message = "User signup success";
                      result.token = token;
                      result.data = userData;
                      return res.status(status).send(result);
                    } else {
                      result.success = false;
                      let status = 500;
                      result.code = 500;
                      result.message = `User details already present`;
                      result.data = {};
                      return res.status(status).send(result);
                    }
                  }
                }
              } else {
                let query = {
                  userName: req.body.userName,
                };
                let userNameFound = await utils.MODEL_ORM.findOne(
                  utils.MODEL.users,
                  query
                );
                if (userNameFound != null) {
                  result.success = false;
                  let status = 200;
                  result.code = 200;
                  result.message = `User name already exists`;
                  result.data = {
                    userName: req.body.userName,
                  };
                  return res.status(status).send(result);
                } else {
                  let user = await utils.MODEL_ORM.create(
                    utils.MODEL.users,
                    newUser
                  );
                  let userId = user._id;
                  if (user != null) {
                    console.log(
                      "==================== User created ========================"
                    );
                    let userDetails = await utils.MODEL_ORM.findOne(
                      utils.MODEL.users,
                      { _id: userId }
                    );
                    let payload = {
                      _id: userDetails._id,
                      userName: userDetails.userName,
                      name: userDetails.name,
                      //emailId: userDetails.emailId,
                      contactNumber: userDetails.contactNumber,
                    };
                    const token = await utils.GENERATE_TOKEN.generateUserToken(
                      payload
                    );
                    result.data = payload;
                    let userOnlineUpdateQuery = [
                      {
                        _id: user._id,
                      },
                      {
                        $set: {
                          online: true,
                        },
                      },
                      {
                        w: 1,
                      },
                    ];
                    let usersOnline = await utils.MODEL_ORM.update(
                      utils.MODEL.users,
                      userOnlineUpdateQuery
                    );
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
                            isLoggedIn: true,
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
                        isLoggedIn: true,
                      };
                      let usersCreateSession = await utils.MODEL_ORM.create(
                        utils.MODEL.usersSession,
                        userSessionCreateQuery
                      );
                    }
  
                    let userData = {
                      user_id: userDetails._id,
                      name: userDetails.name,
                      // password: req.body.password,
                      gender: req.body.gender,
                      userName: userDetails.userName,
                      //emailId: userDetails.emailId,
                      contactNumber: userDetails.contactNumber,
                      userImage: userDetails.userImage,
                    };
                    logger.info("User Signup success");
                    result.success = true;
                    let status = 201;
                    result.code = 201;
                    result.message = "User signup success";
                    result.token = token;
                    result.data = userData;
                    return res.status(status).send(result);
                  } else {
                    result.success = false;
                    let status = 500;
                    result.code = 500;
                    result.message = `User details already present`;
                    result.data = {};
                    return res.status(status).send(result);
                  }
                }
              }
            }
          }else if (req.body.emailId) {
              let query = {
                emailId: req.body.emailId,
              };
              let userEmail = await utils.MODEL_ORM.findOne(
                utils.MODEL.users,
                query
              );
              if (userEmail != null) {
                result.success = false;
                let status = 200;
                result.code = 200;
                result.message = `Email already exists`;
                result.data = {
                  emailId: req.body.emailId,
                };
                return res.status(status).send(result);
              } else {
                let query = {
                  userName: req.body.userName,
                };
                let userNameFound = await utils.MODEL_ORM.findOne(
                  utils.MODEL.users,
                  query
                );
                if (userNameFound != null) {
                  result.success = false;
                  let status = 200;
                  result.code = 200;
                  result.message = `User name already exists`;
                  result.data = {
                    userName: req.body.userName,
                  };
                  return res.status(status).send(result);
                } else {
                  let user = await utils.MODEL_ORM.create(
                    utils.MODEL.users,
                    newUser
                  );
                  let userId = user._id;
                  if (user != null) {
                    console.log(
                      "==================== User created ========================"
                    );
                    let userDetails = await utils.MODEL_ORM.findOne(
                      utils.MODEL.users,
                      { _id: userId }
                    );
                    let payload = {
                      _id: userDetails._id,
                      userName: userDetails.userName,
                      name: userDetails.name,
                      //emailId: userDetails.emailId,
                      contactNumber: userDetails.contactNumber,
                    };
                    const token = await utils.GENERATE_TOKEN.generateUserToken(
                      payload
                    );
                    result.data = payload;
                    let userOnlineUpdateQuery = [
                      {
                        _id: user._id,
                      },
                      {
                        $set: {
                          online: true,
                        },
                      },
                      {
                        w: 1,
                      },
                    ];
                    let usersOnline = await utils.MODEL_ORM.update(
                      utils.MODEL.users,
                      userOnlineUpdateQuery
                    );
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
                            isLoggedIn: true,
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
                        isLoggedIn: true,
                      };
                      let usersCreateSession = await utils.MODEL_ORM.create(
                        utils.MODEL.usersSession,
                        userSessionCreateQuery
                      );
                    }
                    let mailSecret = await utils.ENCRYPTION.passwordEncryption(
                      req.body.emailId
                    );
                    let verificationQuery = {
                      userId: user._id,
                      secretCode: mailSecret,
                    };
                    let userEmailVrification = await utils.MODEL_ORM.create(
                      utils.MODEL.verification,
                      verificationQuery
                    );
                    console.log("userEmailVrification ", userEmailVrification);
                    let link = `${config.baseUrl}/${user._id}/${mailSecret}`;
                    if (req.body.emailId) {
                      let sendEmail = verifyEmail(link, userDetails.emailId);
                    }

                    let userData = {
                      user_id: userDetails._id,
                      name: userDetails.name,
                      // password: req.body.password,
                      gender: req.body.gender,
                      userName: userDetails.userName,
                      //emailId: userDetails.emailId,
                      contactNumber: userDetails.contactNumber,
                      userImage: userDetails.userImage,
                    };
                    logger.info("User Signup success");
                    result.success = true;
                    let status = 201;
                    result.code = 201;
                    result.message = "User signup success";
                    result.token = token;
                    result.data = userData;
                    return res.status(status).send(result);
                  } else {
                    result.success = false;
                    let status = 500;
                    result.code = 500;
                    result.message = `User details already present`;
                    result.data = {};
                    return res.status(status).send(result);
                  }
                }
              }
            } else {
              let query = {
                userName: req.body.userName,
              };
              let userNameFound = await utils.MODEL_ORM.findOne(
                utils.MODEL.users,
                query
              );
              if (userNameFound != null) {
                result.success = false;
                let status = 200;
                result.code = 200;
                result.message = `User name already exists`;
                result.data = {
                  userName: req.body.userName,
                };
                return res.status(status).send(result);
              } else {
                let user = await utils.MODEL_ORM.create(
                  utils.MODEL.users,
                  newUser
                );
                let userId = user._id;
                if (user != null) {
                  console.log(
                    "==================== User created ========================"
                  );
                  let userDetails = await utils.MODEL_ORM.findOne(
                    utils.MODEL.users,
                    { _id: userId }
                  );
                  let payload = {
                    _id: userDetails._id,
                    userName: userDetails.userName,
                    name: userDetails.name,
                    //emailId: userDetails.emailId,
                    contactNumber: userDetails.contactNumber,
                  };
                  const token = await utils.GENERATE_TOKEN.generateUserToken(
                    payload
                  );
                  result.data = payload;
                  let userOnlineUpdateQuery = [
                    {
                      _id: user._id,
                    },
                    {
                      $set: {
                        online: true,
                      },
                    },
                    {
                      w: 1,
                    },
                  ];
                  let usersOnline = await utils.MODEL_ORM.update(
                    utils.MODEL.users,
                    userOnlineUpdateQuery
                  );
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
                          isLoggedIn: true,
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
                      isLoggedIn: true,
                    };
                    let usersCreateSession = await utils.MODEL_ORM.create(
                      utils.MODEL.usersSession,
                      userSessionCreateQuery
                    );
                  }

                  let userData = {
                    user_id: userDetails._id,
                    name: userDetails.name,
                    // password: req.body.password,
                    gender: req.body.gender,
                    userName: userDetails.userName,
                    //emailId: userDetails.emailId,
                    contactNumber: userDetails.contactNumber,
                    userImage: userDetails.userImage,
                  };
                  logger.info("User Signup success");
                  result.success = true;
                  let status = 201;
                  result.code = 201;
                  result.message = "User signup success";
                  result.token = token;
                  result.data = userData;
                  return res.status(status).send(result);
                } else {
                  result.success = false;
                  let status = 500;
                  result.code = 500;
                  result.message = `User details already present`;
                  result.data = {};
                  return res.status(status).send(result);
                }
              }
            }
         
         
        
        } catch (e) {
          let result = {};
          logger.error("Signup error : ", e);
          result.success = false;
          let status = 500;
          result.code = 500;
          result.message = e.message;
          result.data = null;
          return res.status(status).send(result);
        }
      }
    });
  },
  //=============User login ==================
  login: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      location: Joi.string().required(),
      password: Joi.string().required(),
    });

    const checkDetails = {
      location: req.body.location,
      password: req.body.password,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 422;
        result.code = 422;
        result.message = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        const { contactNumber, emailId, password, location } = req.body;
        console.log(req.body);

        //console.log("req.body ", req.body);
        let result = {};
        try {
          if (contactNumber) {
            let query = {
              contactNumber: contactNumber,
            };
            let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
            if (user != null) {
              let ciphertext = user.password;
              let decrypted = await utils.DECRYPTION.passwordDecryption(
                ciphertext
              );

              // Check user password
              if (decrypted == req.body.password) {
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
                let loc = JSON.parse(location);
                let userOnlineUpdateQuery = [
                  {
                    _id: user._id,
                  },
                  {
                    $set: {
                      online: true,
                      location: loc,
                    },
                  },
                  {
                    w: 1,
                  },
                ];

                let usersOnlineUpdate = await utils.MODEL_ORM.update(
                  utils.MODEL.users,
                  userOnlineUpdateQuery
                );

                console.log("usersOnlineUpdate ", usersOnlineUpdate);

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
                  userImage: user.userImage,
                };

                logger.info("User Login with email success");
                result.success = true;
                result.message = "Login success";
                result.token = token;
                let status = 200;
                result.code = 200;
                result.data = userData;
                return res.status(status).send(result);
              } else {
                logger.info("User Login with email failed");
                result.success = false;
                result.message = "Password not matched";
                result.token = null;
                let status = 200;
                result.code = 200;
                result.data = null;
                return res.status(status).send(result);
              }
            } else {
              result.success = false;
              result.message = `User not found with this contact number`;
              let status = 404;
              result.code = 404;
              result.data = {};
              return res.status(status).send(result);
            }
          } else if (emailId) {
            let query = {
              emailId: emailId,
            };
            let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
            //console.log(" --- user", user);
            if (user != null) {
              let ciphertext = user.password;
              console.log("ciphertext ", ciphertext);
              let decrypted = await utils.DECRYPTION.passwordDecryption(
                ciphertext
              );
              // Check user password
              if (decrypted == req.body.password) {
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
                let loc = JSON.parse(location);
                let userOnlineUpdateQuery = [
                  {
                    _id: user._id,
                  },
                  {
                    $set: {
                      online: true,
                      location: loc,
                    },
                  },
                  {
                    w: 1,
                  },
                ];

                let usersOnlineUpdate = await utils.MODEL_ORM.update(
                  utils.MODEL.users,
                  userOnlineUpdateQuery
                );

                console.log("usersOnlineUpdate ", usersOnlineUpdate);

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
                  userImage: user.userImage,
                };

                logger.info("User Login with email success");
                result.success = true;
                result.message = "Login success";
                result.token = token;
                let status = 200;
                result.code = 200;
                result.data = userData;
                return res.status(status).send(result);
              } else {
                logger.info("User Login with email failed");
                result.success = false;
                result.message = "Password not matched";
                result.token = null;
                let status = 200;
                result.code = 200;
                result.data = null;
                return res.status(status).send(result);
              }
            } else {
              result.success = false;
              result.message = `User not found with this Email`;
              let status = 404;
              result.code = 404;
              result.data = {};
              return res.status(status).send(result);
            }
          } else {
            let result = {};
            logger.error("Login issue");
            result.success = false;
            result.code = 200;
            let status = 200;
            result.message =
              "Please provoide valid Email or Phone number to login";
            result.data = null;
            return res.status(status).send(result);
          }
        } catch (e) {
          let result = {};
          logger.error("Login error : ", e.message);
          result.success = false;
          let status = 500;
          result.code = 500;
          result.message = e.message;
          result.data = null;
          return res.status(status).send(result);
        }
      }
    });
  },
  //=============User social login ==================
  socialLogin: async (req, res) => {
    let contactNumber = req.body.contactNumber;
    let emailId = req.body.emailId;

    let result = {};
    try {
      if (contactNumber) {
        let query = {
          contactNumber: contactNumber,
        };
        let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
        if (user != null) {
          // Create a token
          const payload = {
            _id: user._id,
            name: user.name,
            userName: user.userName,
            emailId: user.emailId,
            contactNumber: user.contactNumber,
          };
          const token = await utils.GENERATE_TOKEN.generateUserToken(payload);
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

          // console.log("usersOnlineUpdate ", usersOnlineUpdate);

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
                  isLoggedIn: true,
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
              isLoggedIn: true,
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
            userImage: user.userImage,
          };

          logger.info("User Login with email success");
          result.success = true;
          result.message = "Login success";
          result.token = token;
          let status = 200;
          result.code = 200;
          result.data = userData;
          return res.status(status).send(result);
        } else {
          result.success = false;
          result.message = `User not found with this contact number`;
          let status = 404;
          result.code = 404;
          result.data = {};
          return res.status(status).send(result);
        }
      } else if (emailId) {
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
          const token = await utils.GENERATE_TOKEN.generateUserToken(payload);
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

          // console.log("usersOnlineUpdate ", usersOnlineUpdate);

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
                  isLoggedIn: true,
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
              isLoggedIn: true,
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
            userImage: user.userImage,
          };

          logger.info("User Login with email success");
          result.success = true;
          result.message = "Login success";
          result.token = token;
          let status = 200;
          result.code = 200;
          result.data = userData;
          return res.status(status).send(result);
        } else {
          result.success = false;
          result.message = `User not found with this Email`;
          let status = 404;
          result.code = 404;
          result.data = {};
          return res.status(status).send(result);
        }
      } else {
        let result = {};

        result.success = false;
        let status = 200;
        result.code = 200;
        result.message = "Please provide email or phone number";
        result.data = null;
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Login error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
  //=============User details ================
  getUserDetails: async (req, res) => {
    let result = {};

    const payload = req.decoded;

    let query = {
      _id: payload._id,
    };
    try {
      //let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
      let userSchema = userModel.Model;
      let query = { _id: ObjectId(payload._id) };
      let sort = {};
      let selected = "-__v -password";
      let populate = [
        {
          path: "followers",
          select: "name userImage userID _id ",
          model: userSchema,
        },
        {
          path: "following",
          select: "name userImage userID _id ",
          model: userSchema,
        },
      ];
      let user = await utils.MODEL_ORM.findAll(
        utils.MODEL.users,
        query,
        selected,
        populate,
        sort
      );
      if (user.length > 0) {
        //console.log("Single user details found", user);
        result.success = true;
        result.message = "User details found";
        let status = 200;
        result.code = 200;
        result.data = user[0];
        return res.status(status).send(result);
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 404;
        result.code = 404;
        result.data = {};
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user details error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
  //=============Get other User details ================
  getOtherUserDetails: async (req, res) => {
    let result = {};

    const userId = req.params.userId;

    let query = {
      _id: userId,
    };
    try {
      //let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);
      let userSchema = userModel.Model;
      let query = { _id: ObjectId(userId) };
      let sort = {};
      let selected = "-__v -password";
      let populate = [
        {
          path: "followers",
          select: "name userImage userID _id ",
          model: userSchema,
        },
        {
          path: "following",
          select: "name userImage userID _id ",
          model: userSchema,
        },
      ];
      let user = await utils.MODEL_ORM.findAll(
        utils.MODEL.users,
        query,
        selected,
        populate,
        sort
      );
      if (user.length > 0) {
        //console.log("Single user details found", user);
        result.success = true;
        result.message = "User details found";
        let status = 200;
        result.code = 200;
        result.data = user[0];
        return res.status(status).send(result);
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 404;
        result.code = 404;
        result.data = {};
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user details error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
  //=============Edit/Update User Profile================================

  userProfileUpdate: async (req, res) => {
    try {
      const payload = req.decoded;

      let query1 = {
        _id: payload._id,
      };
      let newUser = {};

      if (req.body.name) {
        newUser.name = req.body.name;
      }
      if (req.body.dob) {
        newUser.dob = moment(req.body.dob).format("YYYY-MM-DD");
        console.log("newUser.dob ", newUser.dob);
      }
      if (req.body.relationShipStatus) {
        newUser.relationShipStatus = req.body.relationShipStatus;
      }
      if (req.body.height) {
        newUser.height = req.body.height;
      }
      if (req.body.weight) {
        newUser.weight = req.body.weight;
      }
      if (req.body.profession) {
        newUser.profession = req.body.profession;
      }
      if (req.body.greetingText) {
        newUser.greetings = {
          text: req.body.greetingText,
        };
      }
      if (req.body.address) {
        newUser.address = req.body.address;
      }
      if (req.body.city) {
        newUser.city = req.body.city;
      }
      if (req.body.state) {
        newUser.state = req.body.state;
      }
      if (req.body.zip) {
        newUser.zip = req.body.zip;
      }

      if (req.body.password) {
        newUser.password = await utils.ENCRYPTION.passwordEncryption(
          req.body.password
        );
      }

      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
      if (user) {
        let query2 = [
          {
            _id: payload._id,
          },
          {
            $set: newUser,
          },
          {
            w: 1,
          },
        ];

        let userUpdate = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          query2
        );
        if (userUpdate.nModified) {
          logger.info(`User profile updated successfully`);
          return res.status(200).json({
            success: true,
            code: 200,
            data: {
              msg: `Updated`,
              results: null,
            },
          });
        } else {
          logger.info(`User profile not updated successfully`);
          return res.status(200).json({
            success: false,
            code: 200,
            data: {
              msg: `Failed`,
              results: null,
            },
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          code: 404,
          data: {
            msg: `User not found`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Update error : ", e.message);
      return res.status(500).json({
        success: false,
        code: 500,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //=============User reset password =========
  resetPassword: async (req, res) => {
    let result = {};
    let status = 200;

    //validation
    const schema = Joi.object().keys({
      password: Joi.string().required(),
    });

    const checkDetails = {
      password: req.body.password,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 422;
        result.code = 422;
        result.message = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        try {
          //const payload = req.decoded;
          let query1 = null;
          let query2 = null;
          let encryptedPassword = null;
          let user = null;
          if (req.body.contactNumber) {
            query1 = {
              contactNumber: req.body.contactNumber,
            };
            encryptedPassword = await utils.ENCRYPTION.passwordEncryption(
              req.body.password
            );

            query2 = [
              {
                contactNumber: req.body.contactNumber,
              },
              {
                $set: {
                  password: encryptedPassword,
                },
              },
              {
                w: 1,
              },
            ];

            user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
          }

          if (req.body.emailId) {
            query1 = {
              contactNumber: req.body.contactNumber,
            };
            encryptedPassword = await utils.ENCRYPTION.passwordEncryption(
              req.body.password
            );

            query2 = [
              {
                contactNumber: req.body.emailId,
              },
              {
                $set: {
                  password: encryptedPassword,
                },
              },
              {
                w: 1,
              },
            ];

            user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
          }

          if (user) {
            let userUpdate = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              query2
            );
            if (userUpdate.nModified) {
              logger.info(
                `User with contact number : ${user.userName}, password changed successfully`
              );

              result.success = true;
              let status = 200;
              result.code = 200;
              result.message = "Password changed succesfully...";
              result.data = {};
              return res.status(status).send(result);
            } else {
              logger.info(
                `Password change problem : Failed to change ${req.body.contactNumber} password`
              );

              result.success = false;
              let status = 200;
              result.code = 200;
              result.message = `Failed to change ${req.body.contactNumber} password`;
              result.data = {};
              return res.status(status).send(result);
            }
          } else {
            result.success = false;
            let status = 404;
            result.code = 404;
            result.message = `User with ${req.body.contactNumber} not found`;
            result.data = {};
            return res.status(status).send(result);
          }
        } catch (e) {
          let result = {};
          logger.error("Reset password error : ", e.message);
          result.success = false;
          let status = 500;
          result.code = 500;
          result.message = e.message;
          result.data = null;
          return res.status(status).send(result);
        }
      }
    });
  },
  //=============User logout =================
  logOut: async (req, res) => {
    let result = {};
    try {
      const payload = req.decoded;
      console.group("Am in logout", payload);
      let query1 = {
        user_id: payload._id,
      };

      let query2 = [
        {
          user_id: payload._id,
        },
        {
          $set: {
            token: "",
            isLoggedIn: false,
          },
        },
        {
          w: 1,
        },
      ];

      let user = await utils.MODEL_ORM.findOne(
        utils.MODEL.usersSession,
        query1
      );

      let userOnlineUpdateQuery = [
        {
          _id: payload._id,
        },
        {
          $set: {
            online: false,
          },
        },
        {
          w: 1,
        },
      ];

      let usersOnline = await utils.MODEL_ORM.update(
        utils.MODEL.users,
        userOnlineUpdateQuery
      );
      if (user) {
        let userUpdate = await utils.MODEL_ORM.update(
          utils.MODEL.usersSession,
          query2
        );
        if (userUpdate.nModified) {
          logger.info(
            `User with contact number : ${payload.contactNumber}, logout`
          );

          result.success = true;
          let status = 200;
          result.code = 200;
          result.message = `Logout success`;
          result.data = {};
          return res.status(status).send(result);
        } else {
          logger.info(
            `User with contact number : ${payload.contactNumber}, logout failed`
          );
          result.success = false;
          let status = 424;
          result.code = 424;
          result.message = `Failed to logout`;
          result.data = {};
          return res.status(status).send(result);
        }
      } else {
        result.success = false;
        let status = 404;
        result.code = 404;
        result.message = `User not found`;
        result.data = {};
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Logout error : ", e);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
  //=============App registration ============
  appReg: async (req, res) => {
    let result = {};
    //validation
    const schema = Joi.object().keys({
      reg_id: Joi.string().required(),
    });

    const checkDetails = {
      reg_id: req.body.reg_id,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 422;
        result.code = 422;
        result.message = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        try {
          const payload = req.decoded;
          let query1 = {
            userId: payload._id,
          };

          let user = await utils.MODEL_ORM.findOne(
            utils.MODEL.appregistration,
            query1
          );
          console.log(user);
          if (user) {
            let query2 = [
              {
                userId: payload._id,
              },
              {
                $set: {
                  reg_id: "",
                },
              },
              {
                w: 1,
              },
            ];
            let userUpdate1 = await utils.MODEL_ORM.update(
              utils.MODEL.appregistration,
              query2
            );
            let query3 = [
              {
                userId: payload._id,
              },
              {
                $set: {
                  reg_id: req.body.reg_id,
                },
              },
              {
                w: 1,
              },
            ];
            let userUpdate = await utils.MODEL_ORM.update(
              utils.MODEL.appregistration,
              query3
            );
            console.log(userUpdate.nModified);
            if (userUpdate.nModified) {
              logger.info(
                `User with contact number : ${payload.contactNumber}, registaration id updated on login`
              );

              result.success = true;
              let status = 200;
              result.code = 200;
              result.message = `Updated`;
              result.data = {};
              return res.status(status).send(result);
            } else {
              logger.info(
                `App registration : Failed for contactNumber ${payload.contactNumber}`
              );
              result.success = false;
              let status = 424;
              result.code = 424;
              result.message = `Failed`;
              result.data = {};
              return res.status(status).send(result);
            }
          } else {
            let query = {
              userId: payload._id,
              reg_id: req.body.reg_id,
            };

            let user = await utils.MODEL_ORM.create(
              utils.MODEL.appregistration,
              query
            );
            if (user != undefined) {
              result.success = true;
              let status = 200;
              result.code = 200;
              result.message = `Updated`;
              result.data = {};
              return res.status(status).send(result);
            } else {
              result.success = false;
              let status = 424;
              result.code = 424;
              result.message = `Failed`;
              result.data = {};
              return res.status(status).send(result);
            }
          }
        } catch (e) {
          let result = {};
          logger.error("App registration error : ", e.message);
          result.success = false;
          let status = 500;
          result.code = 500;
          result.message = e.message;
          result.data = null;
          return res.status(status).send(result);
        }
      }
    });
  },

  // Agora ===================================
  getUserAccessToken: async (req, res) => {
    const schema = Joi.object().keys({
      // uid: Joi.number().required(),
      // role: Joi.string().required(),
      // expireTime: Joi.number().required(),
      channelName: Joi.string().required(),
    });

    const checkDetails = {
      // uid: req.body.uid,
      // role: req.body.role,
      // expireTime: req.body.expireTime,
      channelName: req.query.channelName,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let userQuery = {
            _id: payload._id,
          };
          //console.log("userQuery is", userQuery);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            userQuery
          );
          //console.log("userDetails is", userDetails);
          if (userDetails != null) {
            const APP_ID = config.AGORA_APP_ID;
            const APP_CERTIFICATE = config.AGORA_APP_CERTIFICATE;

            // get uid
            let uid = req.query.uid;
            if (!uid || uid == "") {
              uid = 0;
            }
            // get role
            let role = RtcRole.SUBSCRIBER;
            if (req.query.role == "publisher") {
              role = RtcRole.PUBLISHER;
            }
            // get the expire time
            let expireTime = req.query.expireTime;
            if (!expireTime || expireTime == "") {
              expireTime = 3600;
            } else {
              expireTime = parseInt(expireTime, 10);
            }

            const channelName = req.query.channelName;
            // calculate privilege expire time
            const currentTime = Math.floor(Date.now() / 1000);
            const privilegeExpireTime = currentTime + expireTime;
            const token = RtcTokenBuilder.buildTokenWithUid(
              APP_ID,
              APP_CERTIFICATE,
              channelName,
              uid,
              role,
              privilegeExpireTime
            );
            // console.log("Token With UserAccount: " + token);
            let userData = {
              channelName: channelName,
              token: token,
            };
            // console.log("userData in body", userData);

            if (userData) {
              logger.info(`Token Generated`);
              return res.status(200).json({
                success: true,
                code: 200,
                data: {
                  msg: `Token Generated`,
                  results: userData,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
                code: 200,
                data: {
                  msg: `Failed `,
                  results: null,
                },
              });
            }
          } else {
            logger.info(
              `unauthorized : user with this id : ${payload.user} not found`
            );
            return res.status(200).json({
              success: false,
              code: 200,
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Generate Agora Token error : ", e);
          return res.status(500).json({
            success: false,
            code: 500,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  // Verify User Email ===================================
  verifyUserEmail: async (req, res) => {
    console.log("am in verify email", req.params);

    try {
      let userQuery = {
        userId: req.params.userId,
        secretCode: req.params.secret,
      };
      //console.log("userQuery is", userQuery);
      let userDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.verification,
        userQuery
      );
      console.log("user verification Details is", userDetails);
      if (userDetails != null) {
        let userVerificationDeleteQuery = {
          _id: userDetails._id,
        };
        //console.log("userDeleteQuery is", userDeleteQuery);
        let userVerivicationDelete = await utils.MODEL_ORM.delete(
          utils.MODEL.verification,
          userVerificationDeleteQuery
        );

        let userEmailUpdateQuery = [
          {
            _id: req.params.userId,
          },
          {
            $set: {
              emailVerified: true,
            },
          },
          {
            w: 1,
          },
        ];

        let userEmailUpdate = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          userEmailUpdateQuery
        );

        res.sendFile(path.join(__dirname + "/email_verification_success.html"));
      } else {
        logger.info(`unauthorized`);
        return res.status(200).json({
          success: false,
          code: 200,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Email verivication error : ", e);
      return res.status(500).json({
        success: false,
        code: 500,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  // verify User phone ===================================
  verifyUserPhone: async (req, res) => {
    const schema = Joi.object().keys({
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      status: req.body.status,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let userQuery = {
            _id: payload._id,
          };
          //console.log("userQuery is", userQuery);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            userQuery
          );
          //console.log("userDetails is", userDetails);
          if (userDetails != null) {
            let userPhoneUpdateQuery = [
              {
                _id: payload._id,
              },
              {
                $set: {
                  phoneVerified: req.body.status,
                },
              },
              {
                w: 1,
              },
            ];

            let userPhoneUpdate = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              userPhoneUpdateQuery
            );

            if (userPhoneUpdate.nModified) {
              logger.info(`Success`);
              return res.status(200).json({
                success: true,
                code: 200,
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
                code: 200,
                data: {
                  msg: `Failed `,
                  results: null,
                },
              });
            }
          } else {
            logger.info(
              `unauthorized : user with this id : ${payload.user} not found`
            );
            return res.status(200).json({
              success: false,
              code: 200,
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Phone verification error : ", e);
          return res.status(500).json({
            success: false,
            code: 500,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  blockUser: async (req, res) => {
    const payload = req.decoded;
    let updateQuery = [
      {
        _id: payload._id,
      },
      {
        $set: {
          blocked: true,
        },
      },
      {
        w: 1,
      },
    ];
    let updatedfollowing = await utils.MODEL_ORM.update(
      utils.MODEL.users,
      updateQuery
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "User blocked",
      data: null,
    });
  },

  unBlockUser: async (req, res) => {
    const payload = req.decoded;
    let updateQuery = [
      {
        _id: payload._id,
      },
      {
        $set: {
          blocked: false,
        },
      },
      {
        w: 1,
      },
    ];
    let updatedfollowing = await utils.MODEL_ORM.update(
      utils.MODEL.users,
      updateQuery
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "User unblocked",
      data: null,
    });
  },

  deleteUser: async (req, res) => {
    const payload = req.decoded;
    let deleteQuery = {
      _id: payload._id,
    };

    await utils.MODEL_ORM.deleteOne(utils.MODEL.users, query1, (err, data) => {
      if (err)
        return res.status(400).json({
          success: false,
          code: 400,
          message: err,
        });
      else
        return res.status(200).json({
          success: true,
          code: 200,
          message: "user deleted",
        });
    });
  },
  //=============Get opposite gender list ================
  getListOfOppositeGender: async (req, res) => {
    let result = {};

    const payload = req.decoded;

    let query1 = {
      _id: payload._id,
    };
    try {
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
      if (user) {
        let gender = user.gender;
        let query = {
          gender: true,
          role: "HOST",
          host: true,
        };
        if (gender) {
          query = {
            gender: false,
            role: "USER",
            host: false,
          };
        }

        //let users = await utils.MODEL_ORM.findAll(utils.MODEL.users, query);
        // const filteredPeople = users.filter(
        //   (item) => item.emailId !== payload.emailId
        // );
        // let selected =
        //   " _id agencyId userImage userName gender userID role online dob";
        let selected = "-__v -password";
        let populate = [];
        let sort = { created_date: 1 };
        let users = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );
        if (users.length > 0) {
          result.success = true;
          result.message = "Users details found";
          let status = 200;
          result.code = 200;
          result.data = users;
          return res.status(status).send(result);
        } else {
          result.message = "Users not found";
          result.success = false;
          let status = 404;
          result.code = 404;
          result.data = [];
          return res.status(status).send(result);
        }
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 404;
        result.code = 404;
        result.data = [];
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user opposite gender details error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },

  //=============Get Recommended list ================
  getRecommendedList: async (req, res) => {
    let result = {};

    const payload = req.decoded;

    let query1 = {
      _id: payload._id,
    };
    try {
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
      if (user) {
        let gender = user.gender;
        let query = {
          recommended: true,
          gender: true,
          role: "HOST",
          host: true,
        };
        if (gender) {
          query = {
            recommended: true,
            gender: false,
            role: "USER",
            host: false,
          };
        }

        //let users = await utils.MODEL_ORM.findAll(utils.MODEL.users, query);
        // let selected =
        //   " _id agencyId userImage userName gender userID role online dob";
        let selected = "-__v -password";
        let populate = [];
        let sort = { created_date: 1 };
        let users = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );
        // const filteredPeople = users.filter(
        //   (item) => item.emailId !== payload.emailId
        // );
        if (users.length > 0) {
          result.success = true;
          result.message = "Users details found";
          let status = 200;
          result.code = 200;
          result.data = users;
          return res.status(status).send(result);
        } else {
          result.message = "Users not found";
          result.success = false;
          let status = 404;
          result.code = 404;
          result.data = [];
          return res.status(status).send(result);
        }
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 404;
        result.data = [];
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user recommended details error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },

  //=============Get Nearby list ================
  getNearbyList: async (req, res) => {
    let result = {};

    const payload = req.decoded;

    let query1 = {
      _id: payload._id,
    };
    try {
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);

      let userLocation = user.location;
      let userRole = user.role;
      let userHost = user.host;
      console.log("userLocation ", userLocation);
      if (user) {
        // let query = {
        //   location: {
        //     $nearSphere: {
        //       $geometry: { type: "Point", coordinates: userLocation },
        //       $maxDistance: 2000,
        //     },
        //   },
        // };
        //https://stackoverflow.com/questions/32199658/create-find-geolocation-in-mongoose
        //   User.aggregate(
        //     [
        //         { "$geoNear": {
        //             "near": {
        //                 "type": "Point",
        //                 "coordinates": userLocation
        //             },
        //             "distanceField": "distance",
        //             "spherical": true,
        //             "maxDistance": 10000
        //         }}
        //     ],
        //     function(err,results) {

        //     }
        // )

        // let pipeline = [
        //   {
        //     $geoNear: {
        //       near: {
        //         type: "Point",
        //         coordinates: userLocation.coordinates,
        //       },
        //       spherical: true,
        //       maxDistance: 10 * 1609.34,
        //       distanceMultiplier: 1,
        //       distanceField: "distance",
        //     },
        //   },
        // ];
        // let pipeline = [
        //   {
        //     $geoNear: {
        //       near: {
        //         type: "Point",
        //         coordinates: [
        //           userLocation.coordinates[0],
        //           userLocation.coordinates[1],
        //         ],
        //       },
        //       spherical: true,
        //       distanceField: "distance",
        //       distanceMultiplier: 0.001,
        //     },
        //   },
        // ];

        // let users = await utils.MODEL_ORM.aggregation(
        //   utils.MODEL.users,
        //   pipeline
        // );
        // let query = {
        //   location: {
        //     $near: {
        //       $geometry: {
        //         type: "Point",
        //         coordinates: userLocation.coordinates,
        //       },
        //       $minDistance: 1000, //meters
        //       $maxDistance: 5000, //meters
        //     },
        //   },
        // };

        // let query = {
        //   location: {
        //     $near: {
        //       //$maxDistance: 1000,
        //       $geometry: {
        //         type: "Point",
        //         coordinates: userLocation.coordinates,
        //       },
        //     },
        //   },
        // };

        // let query = {
        //   "location.coordinates": {
        //     $geometry: {
        //       type: "Point",
        //       coordinates: userLocation.coordinates,
        //     },
        //     $minDistance: 1000, //meters
        //     $maxDistance: 5000, //meters
        //   },
        // };
        //let users = await utils.MODEL_ORM.findAll(utils.MODEL.users, query);
        //var METERS_PER_MILE = 1609.34;

        let maxDistance = 6213.712; //(6213.712 miles = 10000 kms distance)

        // we need to convert the distance to radians
        // The equatorial radius of the Earth is approximately 3,963.2 miles or 6,378.1 kilometers.
        maxDistance = maxDistance / 3963.2;
        let query2 = {};
        let gender = user.gender;

        if (userRole == "USER") {
          query2 = {
            role: "HOST",
            host: true,
            gender: true,
            location: {
              $geoWithin: { $centerSphere: [userLocation, maxDistance] },
            },
          };
        } else {
          query2 = {
            role: "USER",
            host: false,
            gender: false,
            location: {
              $geoWithin: { $centerSphere: [userLocation, maxDistance] },
            },
          };
        }
        console.log("query2 ", query2)

        // let query = {
        //   role: "HOST",
        //   host: true,
        //   location: {
        //     $near: userLocation,
        //     $maxDistance: maxDistance,
        //   },
        // };
        // let selected =
        //   " _id agencyId userImage userName gender userID role online dob location";
        let selected = "-__v -password";
        let populate = [];
        let sort = { created_date: 1 };
        let users = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query2,
          selected,
          populate,
          sort
        );
        console.log("Near by users ", users);
        const filteredPeople = users.filter(
          (item) => item._id !== payload._id
        );
        if (filteredPeople.length > 0) {
          result.success = true;
          result.message = "Users details found";
          let status = 200;
          result.code = 200;
          result.data = filteredPeople;
          return res.status(status).send(result);
        } else {
          result.message = "Users not found";
          result.success = false;
          let status = 200;
          result.code = 200;
          result.data = [];
          return res.status(status).send(result);
        }
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 200;
        result.code = 200;
        result.data = [];
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user nearby details error : ", e);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },

  //=============push notification fire base==================

  sendNotification: async (req, res) => {
    const schema = Joi.object().keys({
      receiverId: Joi.string().required(),
      notificationTitle: Joi.string().required(),
      notificationBody: Joi.string().required(),
    });

    const checkDetails = {
      receiverId: req.body.receiverId,
      notificationTitle: req.body.notificationTitle,
      notificationBody: req.body.notificationBody,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let query1 = {
            _id: payload._id,
          };
          console.log("query1", query1);
          let userFrom = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );
          console.log("userFrom", userFrom);
          if (userFrom) {
            let query2 = {
              userId: req.body.receiverId,
            };
            console.log("query2", query2);
            let userTo = await utils.MODEL_ORM.findOne(
              utils.MODEL.appregistration,
              query2
            );
            console.log("userTo", userTo);
            if (userTo) {
              let query2 = {
                userId: req.body.receiverId,
              };
              console.log("query2 is", query2);
              let userToAppReg = await utils.MODEL_ORM.findOne(
                utils.MODEL.appregistration,
                query2
              );
              console.log("userToAppReg is", userToAppReg);
              if (userToAppReg) {
                if (userToAppReg.reg_id != "") {
                  let registrationToken = userToAppReg.reg_id;
                  // var pushpayload = {
                  //   data: {
                  //     title: payload.name,
                  //     // body: req.body.notificationBody,
                  //     data: req.body.notificationBody,
                  //     sound: "default",
                  //     userFromId: payload._id,
                  //     userName: payload.name,
                  //     notificationTitle: req.body.notificationTitle,
                  //     // priority: "high",
                  //   },
                  //   token: registrationToken,
                  //   android: {
                  //     priority: "high",
                  //   },
                  //   // apns: {
                  //   //   headers: {
                  //   //     "apns-priority": "5",
                  //   //   },
                  //   // },
                  //   // webpush: {
                  //   //   headers: {
                  //   //     Urgency: "high",
                  //   //   },
                  //   // },
                  // };

                  // console.log("pushpayload is", pushpayload);
                  var options = {
                    priority: "normal",
                    timeToLive: 60 * 60,
                  };
                  // let notification = await notify(
                  //   registrationToken,
                  //   pushpayload,
                  //   options
                  // );

                  // let notification = await notify(pushpayload);
                  //==========================================================================
                  var pushpayload = {
                    data: {
                      title: payload.name,
                      body: req.body.notificationBody,
                      sound: "default",
                      userFromId: payload._id,
                      userName: payload.name,
                    },
                  };
                  console.log("pushpayload is", pushpayload);
                  var options = {
                    priority: "normal",
                    timeToLive: 60 * 60,
                  };
                  let notification = await pushnotify(
                    registrationToken,
                    pushpayload,
                    options
                  );
                  console.log("notification is", notification);
                  if (notification) {
                    console.log("Push notification : Success");
                    return res.status(200).json({
                      success: true,
                      code: 200,
                      data: {
                        msg: `Success`,
                        results: null,
                      },
                    });
                  } else {
                    console.log("Push notification : Failed");
                    return res.status(200).json({
                      success: false,
                      code: 200,
                      data: {
                        msg: `Failed`,
                        results: null,
                      },
                    });
                  }
                } else {
                  console.log(
                    "Push notification : Receiver app token not found"
                  );
                  return res.status(200).json({
                    success: false,
                    code: 200,
                    data: {
                      msg: `Receiver app token not found`,
                      results: null,
                    },
                  });
                }
              } else {
                console.log("Push notification : Receiver app not registered");
                return res.status(200).json({
                  success: false,
                  code: 200,
                  data: {
                    msg: `Receiver app not registered`,
                    results: null,
                  },
                });
              }
            } else {
              console.log("Push notification : Receiver details not found");
              return res.status(200).json({
                success: false,
                code: 200,
                data: {
                  msg: `Receiver details not found`,
                  results: null,
                },
              });
            }
          } else {
            console.log("Push notification : Sender details not found");
            return res.status(200).json({
              success: false,
              code: 200,
              data: {
                msg: `Sender details not found`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Push notification error : ", e.message);
          return res.status(500).json({
            success: false,
            code: 500,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  //=============User follow==================

  follow: async (req, res) => {
    const schema = Joi.object().keys({
      followId: Joi.string().required(),
    });

    const checkDetails = {
      followId: req.body.followId,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          //console.log("payload", payload);
          const follow = req.body.followId;
          let query1 = {
            _id: payload._id,
          };
          //console.log("query1", query1);
          let userFrom = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );
          // console.log("userFrom", userFrom);
          if (userFrom) {
            let query2 = {
              _id: req.body.followId,
            };
            // console.log("query2", query2);
            let userTo = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query2
            );
            // console.log("userTo", userTo);
            if (userTo) {
              let updateQuery1 = [
                {
                  _id: ObjectId(payload._id),
                },
                {
                  $addToSet: {
                    following: ObjectId(follow),
                  },
                },
                {
                  w: 1,
                },
              ];

              let updateQuery2 = [
                {
                  _id: ObjectId(follow),
                },
                {
                  $addToSet: {
                    followers: ObjectId(payload._id),
                  },
                },
                {
                  w: 1,
                },
              ];

              let updatedfollowing = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                updateQuery1
              );

              let updatedfollowers = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                updateQuery2
              );

              return res.status(200).json({
                success: true,
                code: 200,
                message: "Followed",
                data: {},
              });
            } else {
              console.log("Follow user : followId not found");
              return res.status(404).json({
                success: false,
                code: 404,
                message: `followId not found`,
                data: {},
              });
            }
          } else {
            console.log("Follow user : Follower details not found");
            return res.status(404).json({
              success: false,
              code: 404,
              message: `Follower details not found`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`Follow user error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User unfollow==================

  unfollow: async (req, res) => {
    const schema = Joi.object().keys({
      followId: Joi.string().required(),
    });

    const checkDetails = {
      followId: req.body.followId,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          //console.log("payload", payload);
          const follow = req.body.followId;
          let query1 = {
            _id: payload._id,
          };
          //console.log("query1", query1);
          let userFrom = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );
          // console.log("userFrom", userFrom);
          if (userFrom) {
            let query2 = {
              _id: req.body.followId,
            };
            // console.log("query2", query2);
            let userTo = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query2
            );
            // console.log("userTo", userTo);
            if (userTo) {
              let updateQuery1 = [
                {
                  _id: ObjectId(payload._id),
                },
                {
                  $pull: {
                    following: ObjectId(follow),
                  },
                },
                {
                  w: 1,
                },
              ];

              let updateQuery2 = [
                {
                  _id: ObjectId(follow),
                },
                {
                  $pull: {
                    followers: ObjectId(payload._id),
                  },
                },
                {
                  w: 1,
                },
              ];

              let updatedfollowing = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                updateQuery1
              );

              let updatedfollowers = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                updateQuery2
              );

              return res.status(200).json({
                success: true,
                code: 200,
                message: `Unfollowed`,
                data: {},
              });
            } else {
              console.log("Follow user : followId not found");
              return res.status(404).json({
                success: false,
                code: 404,
                message: `followId not found`,
                data: {},
              });
            }
          } else {
            console.log("Follow user : Follower details not found");
            return res.status(404).json({
              success: false,
              code: 404,
              message: `Follower details not found`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`Follow user error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User recharge wallet==================

  rechargeWallet: async (req, res) => {
    const schema = Joi.object().keys({
      amount: Joi.number().required(),
      currency: Joi.string().required(),
    });

    const checkDetails = {
      amount: req.body.amount,
      currency: req.body.currency,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          //console.log("payload", payload);
          const amount = req.body.amount;
          const currency = req.body.currency;

          let rechargeDetails = await getRechargeDetails(amount, currency);

          if (rechargeDetails.dimonds == null) {
            console.log("Please choose valid amount");
            return res.status(200).json({
              success: false,
              code: 200,
              message: "Please choose valid amount",
              data: {},
            });
          } else {
            let query1 = {
              _id: payload._id,
            };
            //console.log("query1", query1);
            let userDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query1
            );
            // console.log("userFrom", userFrom);
            if (userDetails) {
              let dimonds = parseInt(rechargeDetails.dimonds);
              let userWalletBal = userDetails.wallet.amount;
              let receiptNo = Math.floor(new Date().getTime() / 1000.0);

              let options = {
                amount: amount, // amount in the smallest currency unit
                currency: "INR",
                receipt: `order_rcptid_${receiptNo}`,
              };
              instance.orders.create(options, async function (err, order) {
                if (err) {
                  logger.error(`User rezorpay payment error : , ${err}`);
                  return res.status(500).json({
                    success: false,
                    code: 500,
                    message: err,
                    data: {},
                  });
                } else {
                  console.log("Rezorpay order ", order);
                  if (order.status == "created") {
                    userWalletBal = parseFloat(userWalletBal) + dimonds;

                    let updateQuery = [
                      {
                        _id: ObjectId(payload._id),
                      },
                      {
                        $set: {
                          "wallet.amount": userWalletBal,
                        },
                      },
                      {
                        w: 1,
                      },
                    ];

                    let updatedWallet = await utils.MODEL_ORM.update(
                      utils.MODEL.users,
                      updateQuery
                    );
                    let userPayment = await utils.MODEL_ORM.create(
                      utils.MODEL.payments,
                      {
                        userId: payload._id,
                        orderDetails: order,
                        amount: amount,
                        dimonds: dimonds,
                      }
                    );
                    console.log("User wallet details updated on recharge");
                    return res.status(200).json({
                      success: true,
                      code: 200,
                      message: `Success`,
                      data: order,
                    });
                  } else {
                    console.log(
                      "User wallet details not updated on recharge problem in payment gateway",
                      order
                    );
                    return res.status(200).json({
                      success: false,
                      code: 200,
                      message: `Failed`,
                      data: {},
                    });
                  }
                }
              });
            } else {
              console.log("User wallet details not found");
              return res.status(404).json({
                success: false,
                code: 404,
                message: `User details not found`,
                data: {},
              });
            }
          }
        } catch (e) {
          logger.error(`User video call spending error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User video call spendings==================

  videoCallSpendings: async (req, res) => {
    const schema = Joi.object().keys({
      hostId: Joi.string().required(),
      liveDuration: Joi.number().required(),
      callDuration: Joi.number().required(),
    });

    const checkDetails = {
      hostId: req.body.hostId,
      liveDuration: req.body.liveDuration,
      callDuration: req.body.callDuration,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          const type = "video_call";
          const liveDuration = req.body.liveDuration;
          const callDuration = req.body.callDuration;
          const hostId = req.body.hostId;
          let earning = 0;

          let query1 = {
            _id: payload._id,
          };

          let query2 = {
            _id: hostId,
          };
          //console.log("query1", query1);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );

          let hostDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query2
          );
          // console.log("userFrom", userFrom);
          if (userDetails) {
            let chargeDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.charges,
              { type: type }
            );

            let userSpendPerSecs = parseFloat(
              chargeDetails.userSpend.amount / 60
            );
            let hostReceivePerSecs = parseFloat(
              chargeDetails.hostReceive.amount / 60
            );

            let spendings = parseFloat(userSpendPerSecs * callDuration);
            earning = parseFloat(hostReceivePerSecs * callDuration);

            let reportDetails = {
              hostId: hostId,
              agentId: hostDetails.agencyId,
              hostUserId: hostDetails.userID,
              hostUserName: hostDetails.userName,
              date: moment().format("YYYY-MM-DD"),
              earning: earning,
              liveDuration: liveDuration,
              callDuration: callDuration,
              type: type,
            };

            let userSpend = await utils.MODEL_ORM.create(
              utils.MODEL.reports,
              reportDetails
            );

            let userWalletBal = userDetails.wallet.amount;
            let hostWalletBal = hostDetails.wallet.amount;
            userWalletBal = parseFloat(userWalletBal) - spendings;
            hostWalletBal = parseFloat(hostWalletBal) + earning;

            let userUpdateQuery = [
              {
                _id: ObjectId(payload._id),
              },
              {
                $set: {
                  "wallet.amount": userWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateUserWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              userUpdateQuery
            );

            let hostUpdateQuery = [
              {
                _id: ObjectId(hostId),
              },
              {
                $set: {
                  "wallet.amount": hostWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateHostWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              hostUpdateQuery
            );
            return res.status(200).json({
              success: true,
              code: 200,
              message: `Success`,
              data: {},
            });
          } else {
            console.log("User wallet details not found");
            return res.status(404).json({
              success: false,
              code: 404,
              message: `User details not found`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`User recharge wallet error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User audio call spendings==================

  audioCallSpendings: async (req, res) => {
    const schema = Joi.object().keys({
      hostId: Joi.string().required(),
      liveDuration: Joi.number().required(),
      callDuration: Joi.number().required(),
    });

    const checkDetails = {
      hostId: req.body.hostId,
      liveDuration: req.body.liveDuration,
      callDuration: req.body.callDuration,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          const type = "audio_call";
          const liveDuration = req.body.liveDuration;
          const callDuration = req.body.callDuration;
          const hostId = req.body.hostId;
          let earning = 0;

          let query1 = {
            _id: payload._id,
          };

          let query2 = {
            _id: hostId,
          };
          //console.log("query1", query1);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );

          let hostDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query2
          );
          // console.log("userFrom", userFrom);
          if (userDetails) {
            let chargeDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.charges,
              { type: type }
            );

            let userSpendPerSecs = parseFloat(
              chargeDetails.userSpend.amount / 60
            );
            let hostReceivePerSecs = parseFloat(
              chargeDetails.hostReceive.amount / 60
            );

            let spendings = parseFloat(userSpendPerSecs * callDuration);
            earning = parseFloat(hostReceivePerSecs * callDuration);

            let reportDetails = {
              hostId: hostId,
              agentId: hostDetails.agencyId,
              hostUserId: hostDetails.userID,
              hostUserName: hostDetails.userName,
              date: moment().format("YYYY-MM-DD"),
              earning: earning,
              liveDuration: liveDuration,
              callDuration: callDuration,
              type: type,
            };

            let userSpend = await utils.MODEL_ORM.create(
              utils.MODEL.reports,
              reportDetails
            );

            let userWalletBal = userDetails.wallet.amount;
            let hostWalletBal = hostDetails.wallet.amount;
            userWalletBal = parseFloat(userWalletBal) - spendings;
            hostWalletBal = parseFloat(hostWalletBal) + earning;

            let userUpdateQuery = [
              {
                _id: ObjectId(payload._id),
              },
              {
                $set: {
                  "wallet.amount": userWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateUserWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              userUpdateQuery
            );

            let hostUpdateQuery = [
              {
                _id: ObjectId(hostId),
              },
              {
                $set: {
                  "wallet.amount": hostWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateHostWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              hostUpdateQuery
            );
            return res.status(200).json({
              success: true,
              code: 200,
              message: `Success`,
              data: {},
            });
          } else {
            console.log("User wallet details not found");
            return res.status(404).json({
              success: false,
              code: 404,
              message: `User details not found`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`User audio call spending error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User secret pic unlock spendings ==================

  secretPicSpendings: async (req, res) => {
    const schema = Joi.object().keys({
      hostId: Joi.string().required(),
    });

    const checkDetails = {
      hostId: req.body.hostId,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          const type = "secret_photo_unlock";
          const hostId = req.body.hostId;
          let earning = 0;

          let query1 = {
            _id: payload._id,
          };

          let query2 = {
            _id: hostId,
          };
          //console.log("query1", query1);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query1
          );

          let hostDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query2
          );
          // console.log("userFrom", userFrom);
          if (userDetails) {
            let chargeDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.charges,
              { type: type }
            );

            let spendings = parseFloat(chargeDetails.userSpend.amount);
            earning = parseFloat(chargeDetails.hostReceive.amount);

            let reportDetails = {
              hostId: hostId,
              agentId: hostDetails.agencyId,
              hostUserId: hostDetails.userID,
              hostUserName: hostDetails.userName,
              date: moment().format("YYYY-MM-DD"),
              earning: earning,
              liveDuration: 0,
              callDuration: 0,
              type: type,
            };

            let userSpend = await utils.MODEL_ORM.create(
              utils.MODEL.reports,
              reportDetails
            );

            let userWalletBal = userDetails.wallet.amount;
            let hostWalletBal = hostDetails.wallet.amount;
            userWalletBal = parseFloat(userWalletBal) - spendings;
            hostWalletBal = parseFloat(hostWalletBal) + earning;

            let userUpdateQuery = [
              {
                _id: ObjectId(payload._id),
              },
              {
                $set: {
                  "wallet.amount": userWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateUserWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              userUpdateQuery
            );

            let hostUpdateQuery = [
              {
                _id: ObjectId(hostId),
              },
              {
                $set: {
                  "wallet.amount": hostWalletBal,
                },
              },
              {
                w: 1,
              },
            ];

            let updateHostWallet = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              hostUpdateQuery
            );
            return res.status(200).json({
              success: true,
              code: 200,
              message: `Success`,
              data: {},
            });
          } else {
            console.log("User details not found");
            return res.status(404).json({
              success: false,
              code: 404,
              message: `User details not found`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`User secret pic unlock spending error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User gift spendings ==================

  giftSpendings: async (req, res) => {
    const schema = Joi.object().keys({
      gift: Joi.string().required(),
      hostId: Joi.string().required(),
      //giftAmount: Joi.number().required(),
    });

    const checkDetails = {
      hostId: req.body.hostId,
      gift: req.body.gift,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(422).json({
          success: false,
          code: 422,
          message: err.details[0].message,
          data: {},
        });
      } else {
        try {
          const payload = req.decoded;
          //const type = "gift";
          const hostId = req.body.hostId;
          const gift = req.body.gift;

          let giftDetails = await utils.MODEL_ORM.findOne(utils.MODEL.charges, {
            type: gift,
          });
          if (giftDetails) {
            let earning = 0;

            let query1 = {
              _id: payload._id,
            };

            let query2 = {
              _id: hostId,
            };
            //console.log("query1", query1);
            let userDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query1
            );

            let hostDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.users,
              query2
            );
            // console.log("userFrom", userFrom);
            if (userDetails) {
              let spendings = parseFloat(giftDetails.userSpend.amount);
              earning = parseFloat(giftDetails.hostReceive.amount);

              let reportDetails = {
                hostId: hostId,
                agentId: hostDetails.agencyId,
                hostUserId: hostDetails.userID,
                hostUserName: hostDetails.userName,
                date: moment().format("YYYY-MM-DD"),
                earning: earning,
                liveDuration: 0,
                callDuration: 0,
                type: "gift",
              };

              let userSpend = await utils.MODEL_ORM.create(
                utils.MODEL.reports,
                reportDetails
              );

              let userWalletBal = userDetails.wallet.amount;
              let hostWalletBal = hostDetails.wallet.amount;
              userWalletBal = parseFloat(userWalletBal) - spendings;
              hostWalletBal = parseFloat(hostWalletBal) + earning;

              let userUpdateQuery = [
                {
                  _id: ObjectId(payload._id),
                },
                {
                  $set: {
                    "wallet.amount": userWalletBal,
                  },
                },
                {
                  w: 1,
                },
              ];

              let updateUserWallet = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                userUpdateQuery
              );

              let hostUpdateQuery = [
                {
                  _id: ObjectId(hostId),
                },
                {
                  $set: {
                    "wallet.amount": hostWalletBal,
                  },
                },
                {
                  w: 1,
                },
              ];

              let updateHostWallet = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                hostUpdateQuery
              );
              return res.status(200).json({
                success: true,
                code: 200,
                message: `Success`,
                data: {},
              });
            } else {
              console.log("User details not found");
              return res.status(404).json({
                success: false,
                code: 404,
                message: `User details not found`,
                data: {},
              });
            }
          } else {
            console.log("Gift details not found");
            return res.status(200).json({
              success: false,
              code: 200,
              message: `Please select another gift, this gift is not valied`,
              data: {},
            });
          }
        } catch (e) {
          logger.error(`User gift spending error : , ${e}`);
          return res.status(500).json({
            success: false,
            code: 500,
            message: e.message,
            data: {},
          });
        }
      }
    });
  },

  //=============User wallet balance==================

  getUserWalletBal: async (req, res) => {
    try {
      const payload = req.decoded;

      let query1 = {
        _id: payload._id,
      };
      //console.log("query1", query1);
      let userDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.users,
        query1
      );
      // console.log("userFrom", userFrom);
      if (userDetails) {
        let userWalletDetails = userDetails.wallet;
        return res.status(200).json({
          success: true,
          code: 200,
          message: `Success`,
          data: userWalletDetails,
        });
      } else {
        console.log("Follow user : Follower details not found");
        return res.status(404).json({
          success: false,
          code: 404,
          message: `Follower details not found`,
          data: {},
        });
      }
    } catch (e) {
      logger.error(`Follow user error : , ${e}`);
      return res.status(500).json({
        success: false,
        code: 500,
        message: e.message,
        data: {},
      });
    }
  },

  //=============Get all gifts ================
  getAllGifts: async (req, res) => {
    let result = {};

    const payload = req.decoded;

    let query1 = {
      _id: payload._id,
    };
    try {
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
      if (user) {
        let query = {};
        let selected = " -__v";
        let populate = [];
        let sort = { createdAt: 1 };
        let allRecharges = await utils.MODEL_ORM.findAll(
          utils.MODEL.charges,
          query,
          selected,
          populate,
          sort
        );
        let allGifts = [];

        let promise1 = await allRecharges.map(async (recharge) => {
          if (recharge.category == "gift") {
            allGifts.push(recharge);
          }
        });

        Promise.all(promise1).then(() => {
          if (allGifts.length > 0) {
            result.success = true;
            result.message = "Records found";
            let status = 200;
            result.code = 200;
            result.data = allGifts;
            return res.status(status).send(result);
          } else {
            result.message = "Records not found";
            result.success = false;
            let status = 404;
            result.code = 404;
            result.data = [];
            return res.status(status).send(result);
          }
        });
      } else {
        result.message = "User not found";
        result.success = false;
        let status = 404;
        result.data = [];
        return res.status(status).send(result);
      }
    } catch (e) {
      let result = {};
      logger.error("Get user recommended details error : ", e.message);
      result.success = false;
      let status = 500;
      result.code = 500;
      result.message = e.message;
      result.data = null;
      return res.status(status).send(result);
    }
  },
};

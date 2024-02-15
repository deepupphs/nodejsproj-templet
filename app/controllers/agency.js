const utils = require("../utils");
//const Joi = require("joi");
const Joi = require("@hapi/joi");
const logger = require("../handlers/logHandlers");
const usersModel = require("../models/users");
const config = require("../../config");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
//var admin = require("firebase-admin");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");

async function getSettlementDates(date) {
  return new Promise(async function (resolve, reject) {
    let settlementDates = [];
    var monday = moment(date).startOf("month").day("Monday");
    if (monday.date() > 7) monday.add(7, "d");
    var month = monday.month();
    while (month === monday.month()) {
      settlementDates.push(moment(monday).format("YYYY-MM-DD[T00:00:00.000Z]"));
      monday.add(7, "d");
    }
    resolve(settlementDates);
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

module.exports = {
  login: async (req, res) => {
    //validation
    console.log("am in agency login controller");
    const schema = Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().required(),
    });

    const checkDetails = {
      email: req.body.email,
      password: req.body.password,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = true;
        let status = 200;
        result.message = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        let result = {};
        let status = 200;

        try {
          let query = {
            emailId: req.body.email,
          };

          let agency = await utils.MODEL_ORM.findOne(
            utils.MODEL.agencies,
            query
          );
          console.log(" --- agency", agency);
          if (agency != null) {
            let ciphertext = agency.password;
            let decrypted = await utils.DECRYPTION.passwordDecryption(
              ciphertext
            );
            console.log("decrypted ", decrypted);
            // Check user password
            if (decrypted === req.body.password) {
              status = 200;
              // Create a token
              const payload = {
                user: agency._id,
                emailId: req.body.email,
                role: agency.role,
                name: agency.name,
              };
              const token = await utils.GENERATE_TOKEN.generateUserToken(
                payload
              );
              result.success = true;
              result.message = "Login success";
              result.token = token;
              result.status = status;
              result.data = agency;
              res.status(status).send(result);
            } else {
              result.success = false;
              status = 200;
              result.message = `Wrong Password`;
              result.status = status;
              result.data = {};
              res.status(status).send(result);
            }
          } else {
            result.success = false;
            status = 200;
            result.message = `Email not found`;
            result.status = status;
            result.data = { email: req.body.email };
            console.log(result);
            res.status(status).send(result);
          }
        } catch (e) {
          result.success = false;
          status = 200;
          result.status = status;
          result.message = e;
          result.data = {};
          res.status(status).send(result);
        }
      }
    });
  },

  //================Create host======================================
  createHost: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      userName: Joi.string().required(),
      gender: Joi.boolean().required(),
      phoneVerified: Joi.boolean().required(),
      emailId: Joi.string().email({ minDomainSegments: 2 }).required(),
      contactNumber: Joi.string().required(),
      location: Joi.string().required(),
      password: Joi.string().required(),
      agency: Joi.string().required(),
    });

    const checkDetails = {
      name: req.body.name,
      userName: req.body.userName,
      gender: req.body.gender,
      phoneVerified: req.body.phoneVerified,
      emailId: req.body.emailId,
      contactNumber: req.body.contactNumber,
      location: req.body.userLocation,
      password: req.body.password,
      agency: req.body.agencyId,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 200;
        result.msg = err.details[0].message;
        result.data = null;
        return res.status(status).send(result);
      } else {
        let result = {};
        let status = 200;

        const payload = req.decoded;
        //find admin details first....

        let adminQuery = {
          _id: payload.user,
        };

        let adminDetails = await utils.MODEL_ORM.findOne(
          utils.MODEL.agencies,
          adminQuery
        );

        try {
          if (adminDetails != null) {
            let newUser = {};
            newUser.agencyId = req.body.agencyId;
            newUser.name = req.body.name;
            newUser.userName = req.body.userName;
            newUser.gender = req.body.gender;
            newUser.emailId = req.body.emailId;
            newUser.contactNumber = req.body.contactNumber;
            newUser.location = {
              type: "Point",
              coordinates: JSON.parse(req.body.userLocation),
            };
            newUser.phoneVerified = req.body.phoneVerified;
            if (req.body.gender == true) {
              newUser.userID = `F${Math.floor(new Date().getTime() / 1000.0)}`;
              newUser.role = "HOST";
              newUser.wallet = {
                amount: 0,
                type: "points",
              };
            }

            if (req.body.gender == false) {
              newUser.userID = `M${Math.floor(new Date().getTime() / 1000.0)}`;
              newUser.role = "USER";
              newUser.wallet = {
                amount: 0,
                type: "diamonds",
              };
            }
            if (req.body.dob) {
              newUser.dob = req.body.dob;
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
            let result = {};
            newUser.password = await utils.ENCRYPTION.passwordEncryption(
              req.body.password
            );
            // console.log("user======", newUser);
            // console.log("====================================");
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
              result.msg = `Contact number already exists`;
              result.data = {
                contactNumber: req.body.contactNumber,
              };
              return res.status(status).send(result);
            } else {
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
                result.msg = `Email already exists`;
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
                  result.msg = `User name already exists`;
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
                    let sendEmail = verifyEmail(link, userDetails.emailId);
                    let userData = {
                      _id: userDetails._id,
                      name: userDetails.name,
                      userName: userDetails.userName,
                      emailId: userDetails.emailId,
                      contactNumber: userDetails.contactNumber,
                    };
                    logger.info("Host created by agency");
                    result.success = true;
                    let status = 200;
                    result.msg = "Success";
                    result.data = userData;
                    return res.status(status).send(result);
                  } else {
                    result.success = false;
                    let status = 200;
                    result.msg = `User details already present`;
                    result.data = {};
                    return res.status(status).send(result);
                  }
                }
              }
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Agency with this id : ${payload.user} not found`
            );
            return res.status(200).json({
              success: false,
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          result.success = false;
          status = 500;
          result.status = status;
          result.message = e;
          result.data = {};
          res.status(status).send(result);
        }
      }
    });
  },
  //================Get All hosts======================================
  getAllHosts: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { agencyId: payload.user };
        let selected = " -__v";
        let populate = [];
        let sort = { created_date: -1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );

        if (allUserDetails.length > 0) {
          logger.info(
            "All hosts Details found successfully --",
            allUserDetails
          );

          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: allUserDetails,
            },
          });
        } else {
          return res.status(404).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //=============Get host info================================
  getHostInfo: async (req, res) => {
    try {
      const payload = req.decoded;
      let result = {};

      //find admin details first....

      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { agencyId: payload.user, _id: req.params.hostId };

        let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

        //let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
        // console.log(user[0]);
        let encPass = user.password;

        let decPass = await utils.DECRYPTION.passwordDecryption(encPass);
        user.password = decPass;
        if (user) {
          logger.info(`Host details found`);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Details found`,
              results: user,
            },
          });
        } else {
          result.message = `User not found`;
          return res.status(404).json({
            success: true,
            data: {
              msg: `User not found`,
              results: null,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Status error : ", e);
      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All settlements dashboard======================================
  makeAndGetAllSettlements: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );
      //console.log("adminDetails ", adminDetails);
      const format = "YYYY-MM-DD[T00:00:00.000Z]";
      if (adminDetails != null) {
        let currentDate = null;
        if (req.body.date) {
          currentDate = req.body.date;
          currentDate = moment(currentDate).format(format);
        } else {
          let now = new Date();
          currentDate = moment(now).format(format);
        }
        console.log("currentDate ", currentDate);
        let allSettlementDates = await getSettlementDates(currentDate);
        console.log("allSettlementDates ", allSettlementDates);
        let currentWeek =
          moment(currentDate).isoWeek() -
          moment(currentDate).startOf("month").isoWeek();

        console.log("currentWeek ", currentWeek);
        let settlementDates = [];
        //filter and get only upto present week
        for (let i = 0; i < currentWeek; i++) {
          settlementDates.push(allSettlementDates[i]);
        }
        console.log("settlementDates ", settlementDates);

        let map1 = await settlementDates.map(async (date) => {
          let settlementDate = moment(date).format(
            "YYYY-MM-DD[T00:00:00.000Z]"
          );
          let settlementPrevDate = moment(date)
            .add(-1, "days")
            .format("YYYY-MM-DD[T00:00:00.000Z]");

          let endOfWeek = moment(settlementPrevDate)
            .add(-6, "days")
            .format("YYYY-MM-DD[T00:00:00.000Z]");
          let cycle = `${endOfWeek} ~ ${settlementPrevDate}`;
          //console.log("Settlement cycle ", cycle);

          let pipeline = [
            {
              $match: {
                agentId: ObjectId(payload.user),
                date: {
                  $gte: moment(endOfWeek).format("YYYY-MM-DD"),
                  $lte: moment(settlementPrevDate).format("YYYY-MM-DD"),
                },
              },
            },
            {
              $group: {
                _id: "$hostId",
                agentId: { $first: "$agentId" },
                hostId: { $first: "$hostId" },
                hostUserId: { $first: "$hostUserId" },
                hostUserName: { $first: "$hostUserName" },
                totalEarning: {
                  $sum: "$earning",
                },
                // totalLiveDuration: {
                //   $sum: "$liveDuration",
                // },
                // totalCallDuration: {
                //   $sum: "$callDuration",
                // },
              },
            },
          ];

          let settlements = await utils.MODEL_ORM.aggregation(
            utils.MODEL.reports,
            pipeline
          );
          console.log("Settlement date ", settlementDate);
          console.log(`Settlement cycle ${cycle}`);
          console.log(settlements);
          if (settlements.length > 0) {
            let map = await settlements.map(async (settlement) => {
              let settlementFound = await utils.MODEL_ORM.findOne(
                utils.MODEL.settlements,
                { settlementDate: settlementDate }
              );
              if (settlementFound) {
                console.log(
                  "Settlement already done for this date ",
                  settlementDate
                );
              } else {
                settlement.settlementDate = settlementDate;
                settlement.cycle = {
                  fromDate: endOfWeek,
                  toDate: settlementPrevDate,
                };
                settlement.totalEarning = `${(
                  settlement.totalEarning / config.onePointValue
                ).toFixed(3)}`;
                let query = {
                  agencyId: ObjectId(payload.user),
                  _id: ObjectId(settlement.hostId),
                };

                let hostDetails = await utils.MODEL_ORM.findOne(
                  utils.MODEL.users,
                  query
                );

                let hostWallet = hostDetails.wallet.amount;

                settlement.walletBalanceBefore = `${(
                  hostWallet / config.onePointValue
                ).toFixed(3)}`;

                settlement.accumulatedAmount = (
                  parseFloat(settlement.totalEarning) +
                  parseFloat(settlement.walletBalanceBefore)
                ).toFixed(3);
                settlement.cashOut = Math.round(settlement.accumulatedAmount);

                if (settlement.cashOut >= 0 && settlement.cashOut < 150) {
                  settlement.commission = (
                    (settlement.cashOut * 3) /
                    100
                  ).toFixed(3);
                  settlement.commissionRatio = 3;
                }

                if (settlement.cashOut >= 150 && settlement.cashOut < 500) {
                  settlement.commission = (
                    (settlement.cashOut * 5) /
                    100
                  ).toFixed(3);
                  settlement.commissionRatio = 5;
                }

                if (settlement.cashOut >= 500 && settlement.cashOut < 1000) {
                  settlement.commission = (
                    (settlement.cashOut * 10) /
                    100
                  ).toFixed(3);
                  settlement.commissionRatio = 10;
                }

                if (settlement.cashOut >= 1000 && settlement.cashOut < 3500) {
                  settlement.commission = (
                    (settlement.cashOut * 15) /
                    100
                  ).toFixed(3);
                  settlement.commissionRatio = 15;
                }

                if (settlement.cashOut >= 3500) {
                  settlement.commission = (
                    (settlement.cashOut * 20) /
                    100
                  ).toFixed(3);
                  settlement.commissionRatio = 20;
                }

                settlement.walletBalanceAfter = (
                  settlement.accumulatedAmount - settlement.cashOut
                ).toFixed(3);
                delete settlement._id;
                console.log(settlement);
                let userUpdateQuery = [
                  {
                    _id: ObjectId(settlement.hostId),
                  },
                  {
                    $set: {
                      "wallet.amount":
                        settlement.walletBalanceAfter * config.onePointValue,
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

                let createSettlementDetails = await utils.MODEL_ORM.create(
                  utils.MODEL.settlements,
                  settlement
                );
                console.log(
                  `Settlement details created for date : ${settlementDate}`
                );
                logger.info(
                  `Settlement details created for date : ${settlementDate}`
                );
              }
            });
            Promise.all(map).then(() => {
              logger.info(`settlement done for this cycle`);
            });
          } else {
            console.log("Settlements details not found for this cycle");
          }
        });

        Promise.all(map1).then(() => {
          logger.info(`All settlements done`);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        });
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All monthly reports======================================
  getMonthlyReport: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
        let endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
        if (req.params.month) {
          startOfMonth = moment(req.params.month)
            .startOf("month")
            .format("YYYY-MM-DD");
          endOfMonth = moment(req.params.month)
            .endOf("month")
            .format("YYYY-MM-DD");
        }

        console.log("startOfMonth ", startOfMonth);
        console.log("endOfMonth ", endOfMonth);

        let pipeline = [
          {
            $match: {
              agentId: ObjectId(payload.user),
              date: {
                $gte: startOfMonth,
                $lt: endOfMonth,
              },
            },
          },
          {
            $group: {
              _id: "$date",
              agentId: { $first: "$agentId" },
              hostId: { $first: "$hostId" },
              hostUserId: { $first: "$hostUserId" },
              hostUserName: { $first: "$hostUserName" },
              date: { $first: "$date" },
              totalEarning: {
                $sum: "$earning",
              },
              totalLiveDuration: {
                $sum: "$liveDuration",
              },
              totalCallDuration: {
                $sum: "$callDuration",
              },
            },
          },
          { $sort: { date: -1 } },
        ];

        let monthlyReportData = await utils.MODEL_ORM.aggregation(
          utils.MODEL.reports,
          pipeline
        );
        console.log(
          "Monthly reports Details found successfully --",
          monthlyReportData
        );
        if (monthlyReportData.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: monthlyReportData,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: monthlyReportData,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All daily reports======================================
  getDailyReport: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let date = moment().startOf("month").format("YYYY-MM-DD");

        if (req.params.date) {
          date = moment(req.params.date).format("YYYY-MM-DD");
        }

        console.log("date ", date);
        console.log("endOfMonth ", moment().format("YYYY-MM-DD"));

        let pipeline = [
          {
            $match: {
              agentId: ObjectId(payload.user),
              date: date,
            },
          },
          {
            $group: {
              _id: "$hostId",
              agentId: { $first: "$agentId" },
              hostId: { $first: "$hostId" },
              hostUserId: { $first: "$hostUserId" },
              hostUserName: { $first: "$hostUserName" },
              date: { $first: "$date" },
              totalEarning: {
                $sum: "$earning",
              },
              totalLiveDuration: {
                $sum: "$liveDuration",
              },
              totalCallDuration: {
                $sum: "$callDuration",
              },
            },
          },
          { $sort: { date: -1 } },
        ];

        let dailyReportData = await utils.MODEL_ORM.aggregation(
          utils.MODEL.reports,
          pipeline
        );
        console.log(
          "Daily reports Details found successfully --",
          dailyReportData
        );
        if (dailyReportData.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: dailyReportData,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: dailyReportData,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //===============change paid status====================================
  changePaidStatus: async (req, res) => {
    const hostUserId = req.body.hostUserId;

    let userUpdateQuery = [
      {
        hostUserId: hostUserId,
      },
      {
        $set: {
          status: req.body.status,
        },
      },
      {
        w: 1,
      },
    ];
    let hostData = await utils.MODEL_ORM.update(
      utils.MODEL.settlements,
      userUpdateQuery
    );
    if (hostData.nModified) {
      logger.info(`Paid status changed successfully`);
      return res.status(200).json({
        success: true,
        code: 200,
        data: {
          msg: `Success`,
          results: null,
        },
      });
    } else {
      logger.info(`Paid status not changed successfully`);
      return res.status(200).json({
        success: false,
        code: 200,
        data: {
          msg: `Failed`,
          results: null,
        },
      });
    }
  },

  //================Get host reports======================================
  getHostReport: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
        let endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
        if (req.params.date) {
          startOfMonth = moment(req.params.date)
            .startOf("month")
            .format("YYYY-MM-DD");
          endOfMonth = moment(req.params.date)
            .endOf("month")
            .format("YYYY-MM-DD");
        }

        console.log("startOfMonth ", startOfMonth);
        console.log("endOfMonth ", endOfMonth);

        let query = {
          agentId: ObjectId(payload.user),
          date: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
          hostUserId: req.params.hostId,
        };

        let pipeline = [
          {
            $match: {
              agentId: ObjectId(payload.user),
              date: {
                $gte: startOfMonth,
                $lt: endOfMonth,
              },
              hostUserId: req.params.hostId,
            },
          },
          {
            $group: {
              _id: "$date",
              agentId: { $first: "$agentId" },
              hostId: { $first: "$hostId" },
              hostUserId: { $first: "$hostUserId" },
              hostUserName: { $first: "$hostUserName" },
              date: { $first: "$date" },
              totalEarning: {
                $sum: "$earning",
              },
              totalLiveDuration: {
                $sum: "$liveDuration",
              },
              totalCallDuration: {
                $sum: "$callDuration",
              },
            },
          },
          { $sort: { date: -1 } },
        ];

        let hostReportData = await utils.MODEL_ORM.aggregation(
          utils.MODEL.reports,
          pipeline
        );
        // let hostReportData = await utils.MODEL_ORM.findAll(
        //   utils.MODEL.reports,
        //   query
        // );
        console.log(
          "Host reports Details found successfully --",
          hostReportData
        );
        if (hostReportData.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: hostReportData,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: hostReportData,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All settlements of agency======================================
  getAllAgencySettlements: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let pipeline = [
          {
            $match: {
              agentId: ObjectId(payload.user),
            },
          },
          {
            $group: {
              _id: "$settlementDate",
              settlementDate: { $first: "$settlementDate" },
              cycle: { $first: "$cycle" },
              status: { $first: "$status" },
              commission: {
                $sum: "$commission",
              },
              cashOut: {
                $sum: "$cashOut",
              },
            },
          },
          { $sort: { settlementDate: -1 } },
        ];

        let agencySettlements = await utils.MODEL_ORM.aggregation(
          utils.MODEL.settlements,
          pipeline
        );

        console.log(
          "Agency Settlements reports Details found successfully --",
          agencySettlements
        );
        if (agencySettlements.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: agencySettlements,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: agencySettlements,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All settlements error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get settlement cycle details of agency======================================
  getSettlementCycleDetails: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let date = moment().format("YYYY-MM-DD[T00:00:00.000Z]");
        if (req.params.date) {
          date = req.params.date;
        } else {
          return res.status(200).json({
            success: false,
            data: {
              msg: `Settlement date is required`,
              results: [],
            },
          });
        }

        console.log("date ", date);

        let query = {
          agentId: ObjectId(payload.user),
          settlementDate: new Date(date),
        };
        let selected = " -__v";
        let populate = [];
        let sort = { createdAt: -1 };
        let cycleSettlements = await utils.MODEL_ORM.findAll(
          utils.MODEL.settlements,
          query,
          selected,
          populate,
          sort
        );

        console.log(
          "Agency hosts reports Details found for given settlement date successfully --",
          cycleSettlements
        );
        if (cycleSettlements.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: cycleSettlements,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records not found`,
              results: cycleSettlements,
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All settlements error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  //======================Agency dashboard data ==========================

  getDashboardData: async (req, res) => {
    async function convertedData(data) {
      let months = await data.map(function (item) {
        return item["_id"];
      });

      let users = await data.map(function (item) {
        return item["commission"];
      });
      let newMonths = [];

      var d = new Date();
      var n = d.getFullYear();
      for (let i = 0; i <= 11; i++) {
        let count = i + 1;
        //console.log(count);
        if (months[i] == 1) {
          newMonths.push(`Jan`);
        } else if (months[i] == 2) {
          newMonths.push(`Feb`);
        } else if (months[i] == 3) {
          newMonths.push(`Mar`);
        } else if (months[i] == 4) {
          newMonths.push(`Apr`);
        } else if (months[i] == 5) {
          newMonths.push(`May`);
        } else if (months[i] == 6) {
          newMonths.push(`Jun`);
        } else if (months[i] == 7) {
          newMonths.push(`Jul`);
        } else if (months[i] == 8) {
          newMonths.push(`Aug`);
        } else if (months[i] == 9) {
          newMonths.push(`Sep`);
        } else if (months[i] == 10) {
          newMonths.push(`Oct`);
        } else if (months[i] == 11) {
          newMonths.push(`Nov`);
        } else if (months[i] == 12) {
          newMonths.push(`Dec`);
        }
      }

      let all = {
        labels: newMonths,
        data: users,
      };
      return all;
    }
    try {
      const payload = req.decoded;

      let dataMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      //find admin details first....
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let totalHostCount = await utils.MODEL_ORM.findAll(utils.MODEL.users, {
          agencyId: ObjectId(payload.user),
        });
        // console.log("totalHostCount ", totalHostCount.length);

        let totalGifts = await utils.MODEL_ORM.findAll(utils.MODEL.reports, {
          agentId: ObjectId(payload.user),
          type: "gift",
        });
        //console.log("totalGifts ", totalGifts);

        let pipeline1 = [
          {
            $match: {
              agentId: ObjectId(payload.user),
            },
          },
          {
            $group: {
              _id: null,
              commission: {
                $sum: "$commission",
              },
            },
          },
        ];

        let agencyCommission = await utils.MODEL_ORM.aggregation(
          utils.MODEL.settlements,
          pipeline1
        );
        // console.log("agencyCommission ", agencyCommission);
        let pipeline2 = [
          {
            $match: {
              agentId: ObjectId(payload.user),
              $or: [{ type: "video_call" }, { type: "audio_call" }],
            },
          },
          {
            $group: {
              _id: null,
              callDuration: {
                $sum: "$callDuration",
              },
            },
          },
        ];

        let totalCalls = await utils.MODEL_ORM.aggregation(
          utils.MODEL.reports,
          pipeline2
        );
        //console.log("totalCalls ", totalCalls);

        let pipeline = [
          {
            $match: {
              agentId: ObjectId(payload.user),
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              commission: { $sum: "$commission" },
            },
          },
          { $sort: { _id: 1 } },
        ];

        let cahartData = await utils.MODEL_ORM.aggregation(
          utils.MODEL.settlements,
          pipeline
        );

        //console.log("cahartData ", cahartData);

        let allResult = [];

        await dataMonths.forEach((month) => {
          let item = cahartData.find((data) => data._id === month);

          if (item) {
            allResult.push(item);
          } else {
            allResult.push({ _id: month, commission: 0 });
          }
        });

        let allSortedData = await allResult.sort(function (a, b) {
          return a._id - b._id;
        });

        let chart = await convertedData(allSortedData);
        //console.log("chart ", chart);

        let finalResult = {
          totalHostCount: totalHostCount.length,
          totalEarnings: agencyCommission[0].commission,
          totalCalls: totalCalls[0].callDuration,
          totalGifts: totalGifts.length,
          chart,
        };
        console.log("finalResult ", finalResult);
        return res.status(200).json({
          success: true,
          data: {
            msg: `Data found`,
            results: finalResult,
          },
        });
      } else {
        //if admin with this _id not found
        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
        );

        return res.status(200).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error(`Agency dashboard data error : ${e}`);
      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Assign Host======================================
  assignHost: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        let userID = req.params.userID;

        if (userID) {
          let query = { userID: userID };
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            query
          );
          if (userDetails) {
            if (userDetails.gender) {
              if (userDetails.agencyId == "") {
                let userUpdateQuery = [
                  {
                    userID: userID,
                  },
                  {
                    $set: {
                      agencyId: payload.user,
                    },
                  },
                  {
                    w: 1,
                  },
                ];
                let usersData = await utils.MODEL_ORM.update(
                  utils.MODEL.users,
                  userUpdateQuery
                );

                if (usersData.nModified) {
                  logger.info(`Host assigned to agency successfully`);
                  return res.status(200).json({
                    success: true,
                    code: 200,
                    data: {
                      msg: `Success`,
                      results: null,
                    },
                  });
                } else {
                  logger.info(`Host not assigned to agency successfully`);
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
                logger.info(`User belogs to agency`);
                return res.status(200).json({
                  success: false,
                  code: 200,
                  data: {
                    msg: `User already assigned to agency`,
                    results: null,
                  },
                });
              }
            } else {
              logger.info(`Only female users are assigned`);
              return res.status(200).json({
                success: false,
                code: 200,
                data: {
                  msg: `Only female users are allowed to assigne`,
                  results: null,
                },
              });
            }
          } else {
            logger.info(`User details not found`);
            return res.status(200).json({
              success: false,
              code: 200,
              data: {
                msg: `User ID not found`,
                results: null,
              },
            });
          }
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Please provoid the userID `,
              results: {},
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================update Settlement Status======================================
  updateSettlementStatus: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.agencies,
        adminQuery
      );

      if (adminDetails != null) {
        console.log("req.body ", req.body);

        let userUpdateQuery = [
          {
            _id: req.body.id,
          },
          {
            $set: {
              status: req.body.status,
            },
          },
          {
            w: 1,
          },
        ];
        let usersData = await utils.MODEL_ORM.update(
          utils.MODEL.settlements,
          userUpdateQuery
        );

        if (usersData.nModified) {
          logger.info(`Host settlement status updated successfully`);
          return res.status(200).json({
            success: true,
            code: 200,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          logger.info(`Host not settlement status updated successfully`);
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
        //if admin with this _id not found

        logger.info(
          `unauthorized : Agency with this id : ${payload.user} not found`
        );
        return res.status(401).json({
          success: false,
          data: {
            msg: `Un-authorized access`,
            results: null,
          },
        });
      }
    } catch (e) {
      logger.error("Get All host details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
};

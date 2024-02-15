const utils = require("../utils");
//const Joi = require("joi");
const Joi = require("@hapi/joi");
const logger = require("../handlers/logHandlers");
const agencyModel = require("../models/agencies");
const config = require("../../config");

//var admin = require("firebase-admin");

module.exports = {
  login: async (req, res) => {
    //validation
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
        // send a 200 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
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
          let admin = await utils.MODEL_ORM.findOne(utils.MODEL.admin, query);
          console.log(" --- admin", admin);
          if (admin != null) {
            let ciphertext = admin.password;
            let decrypted = await utils.DECRYPTION.passwordDecryption(
              ciphertext
            );
            console.log("decrypted ", decrypted);
            // Check user password
            if (decrypted === req.body.password) {
              status = 200;
              // Create a token
              const payload = {
                user: admin._id,
                emailId: req.body.email,
                role: admin.role,
              };
              const token = await utils.GENERATE_TOKEN.generateUserToken(
                payload
              );
              result.success = true;
              result.message = "Login success";
              result.token = token;
              result.status = status;
              result.data = admin;
              res.status(status).send(result);
            } else {
              result.success = false;
              status = 401;
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
          status = 500;
          result.status = status;
          result.message = e;
          result.data = {};
          res.status(status).send(result);
        }
      }
    });
  },
  //================Get All Users======================================
  getAllUser: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let agencySchema = agencyModel.Model;
        let query = { role: "USER" };
        let selected = " -__v";
        let populate = [
          {
            path: "agencyId",
            select: "name _id ",
            model: agencySchema,
          },
        ];
        let sort = { created_date: -1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );
        //console.log("allUserDetails ", allUserDetails);

        if (allUserDetails.length > 0) {
          logger.info(
            "All Users Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All user details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All Hosts======================================
  getAllHosts: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let agencySchema = agencyModel.Model;
        let query = { role: "HOST" };
        let selected = " -__v";
        let populate = [
          {
            path: "agencyId",
            select: "name _id ",
            model: agencySchema,
          },
        ];
        let sort = { created_date: -1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );
        //console.log("allUserDetails ", allUserDetails);

        if (allUserDetails.length > 0) {
          logger.info(
            "All Users Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All user details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Get All Hosts======================================
  getAllAgencyHosts: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let agencySchema = agencyModel.Model;
        let query = { agencyId: req.params.agencyId };
        let selected = " -__v";
        let populate = [
          {
            path: "agencyId",
            select: "name _id ",
            model: agencySchema,
          },
        ];
        let sort = { created_date: -1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );
        //console.log("allUserDetails ", allUserDetails);

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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All user details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //=============Get user info================================
  getUserInfo: async (req, res) => {
    try {
      const payload = req.decoded;
      let result = {};

      //find admin details first....

      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query1 = {
          _id: req.params.userId,
        };
        let groupSchema = groupsModel.Model;
        let query = { _id: req.params.userId };
        let selected = "-__v ";
        let populate = [
          {
            path: "groups",
            select: "-__v ",
            model: groupSchema,
          },
        ];
        let sort = { created_date: -1 };

        let user = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          query,
          selected,
          populate,
          sort
        );

        //let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
        // console.log(user[0]);
        if (user) {
          logger.info(`User details found`);
          let newUser = user[0];

          let newWallets = [];
          let walletData = newUser.wallets;

          if (walletData.length) {
            let map = await walletData.map(async (data) => {
              let balance = { balance: 0, used: 0 };
              if (data.coin == "dexa") {
                balance = await utils.DEXA_UTILITY.getBalance(
                  data.address,
                  data.coin,
                  0
                );
              } else if (data.coin == "eth") {
                balance = await utils.DEXA_UTILITY.getBalance(
                  data.address,
                  data.coin,
                  0
                );
              } else {
                balance = await utils.DEXA_UTILITY.getBalance(
                  data.address,
                  data.coin,
                  data.wallet
                );
              }

              let obj = {};
              obj.coin = data.coin;
              obj.address = data.address;
              obj.balance = balance.balance;
              obj.usd = balance.usd;
              console.log(obj);
              newWallets.push(obj);
            });

            Promise.all(map).then((data) => {
              newUser.wallets = newWallets;
              return res.status(200).json({
                success: true,
                data: {
                  msg: `Details found`,
                  results: newUser,
                },
              });
            });
          } else {
            return res.status(200).json({
              success: true,
              data: {
                msg: `Details found`,
                results: newUser,
              },
            });
          }
        } else {
          result.message = `User not found`;
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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

  //=============Host/Not-Host User================================
  makeHost: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      id: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      id: req.body.id,
      status: req.body.status,
    };

    console.log(req.body.id);
    console.log(req.body.status);

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let result = {};

          //find admin details first....

          let adminQuery = {
            _id: payload.user,
          };

          let adminDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.admin,
            adminQuery
          );

          if (adminDetails != null) {
            let query1 = {
              _id: req.body.id,
            };

            let query2 = [
              {
                _id: req.body.id,
              },
              {
                $set: {
                  host: req.body.status,
                },
              },
              {
                w: 1,
              },
            ];

            let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
            //console.log(user);
            if (user) {
              let userUpdate = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                query2
              );
              console.log(userUpdate);
              if (userUpdate.nModified) {
                logger.info(`User made as a Host`);
                return res.status(200).json({
                  success: true,
                  data: {
                    msg: `Success`,
                    results: null,
                  },
                });
              } else {
                logger.info(`Cannot make user as a Host`);
                return res.status(200).json({
                  success: false,
                  data: {
                    msg: `Failed`,
                    results: null,
                  },
                });
              }
            } else {
              result.message = `User not found`;
              return res.status(200).json({
                success: false,
                data: {
                  msg: `User not found`,
                  results: null,
                },
              });
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Admin with this id : ${payload.user} not found`
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
      }
    });
  },

  //=============recommend/not-recommend User================================
  recommendUser: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      id: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      id: req.body.id,
      status: req.body.status,
    };

    console.log(req.body.id);
    console.log(req.body.status);

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let result = {};

          //find admin details first....

          let adminQuery = {
            _id: payload.user,
          };

          let adminDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.admin,
            adminQuery
          );

          if (adminDetails != null) {
            let query1 = {
              _id: req.body.id,
            };

            let query2 = [
              {
                _id: req.body.id,
              },
              {
                $set: {
                  recommended: req.body.status,
                },
              },
              {
                w: 1,
              },
            ];

            let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query1);
            //console.log(user);
            if (user) {
              let userUpdate = await utils.MODEL_ORM.update(
                utils.MODEL.users,
                query2
              );
              if (userUpdate.nModified) {
                logger.info(`User recommend`);
                return res.status(200).json({
                  success: true,
                  data: {
                    msg: `Success`,
                    results: null,
                  },
                });
              } else {
                logger.info(`Cannot recommend User`);
                return res.status(200).json({
                  success: false,
                  data: {
                    msg: `Failed`,
                    results: null,
                  },
                });
              }
            } else {
              result.message = `User not found`;
              return res.status(200).json({
                success: false,
                data: {
                  msg: `User not found`,
                  results: null,
                },
              });
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Admin with this id : ${payload.user} not found`
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
      }
    });
  },

  //======================Admin Chart data ==========================

  getChartData: async (req, res) => {
    async function convertedData(data) {
      let months = await data.map(function (item) {
        return item["_id"];
      });

      let users = await data.map(function (item) {
        return item["users"];
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
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let totalUsersCount = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          {}
        );

        let totalMaleCount = await utils.MODEL_ORM.findAll(utils.MODEL.users, {
          gender: false,
        });
        let totalFemaleCount = await utils.MODEL_ORM.findAll(
          utils.MODEL.users,
          {
            gender: true,
          }
        );

        let totalHostCount = await utils.MODEL_ORM.findAll(utils.MODEL.users, {
          host: true,
        });

        let pipeline = [
          {
            $group: {
              _id: { $month: "$created_date" },
              users: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ];

        let cahartData = await utils.MODEL_ORM.aggregation(
          utils.MODEL.users,
          pipeline
        );

        // console.log(cahartData);

        let allResult = [];

        await dataMonths.forEach((month) => {
          let item = cahartData.find((data) => data._id === month);

          if (item) {
            allResult.push(item);
          } else {
            allResult.push({ _id: month, users: 0 });
          }
        });

        let allSortedData = await allResult.sort(function (a, b) {
          return a._id - b._id;
        });

        let chart = await convertedData(allSortedData);
        //console.log(chart);

        return res.status(200).json({
          success: true,
          data: {
            msg: `Data found`,
            results: {
              totalUsersCount: totalUsersCount.length,
              totalMaleCount: totalMaleCount.length,
              totalFemaleCount: totalFemaleCount.length,
              totalHostCount: totalHostCount.length,
              chart,
            },
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
      logger.error("Add user error : ", e);
      return res.status(500).json({
        success: false,
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
      userId: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      userId: req.body.userId,
      status: req.body.status,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let userQuery = {
            _id: req.body.userId,
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
                _id: req.body.userId,
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
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
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
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Admin phone verification error : ", e);
          return res.status(500).json({
            success: false,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  // verify User email ===================================
  verifyUserEmail: async (req, res) => {
    const schema = Joi.object().keys({
      userId: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      userId: req.body.userId,
      status: req.body.status,
    };

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          let userQuery = {
            _id: req.body.userId,
          };
          //console.log("userQuery is", userQuery);
          let userDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.users,
            userQuery
          );
          //console.log("userDetails is", userDetails);
          if (userDetails != null) {
            let userEmailUpdateQuery = [
              {
                _id: req.body.userId,
              },
              {
                $set: {
                  emailVerified: req.body.status,
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

            if (userEmailUpdate.nModified) {
              logger.info(`Success`);
              return res.status(200).json({
                success: true,
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
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
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Admin email verification error : ", e);
          return res.status(500).json({
            success: false,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  //================Get All agencies======================================
  getAllAgencies: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = {};
        let selected = " -__v";
        let populate = [];
        let sort = { created_date: -1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.agencies,
          query,
          selected,
          populate,
          sort
        );

        if (allUserDetails.length > 0) {
          logger.info(
            "All Users Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All user details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  //================Add agency======================================
  addAgency: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      contactNumber: Joi.string().required(),
      password: Joi.string().required(),
      emailId: Joi.string().email({ minDomainSegments: 2 }).required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zip: Joi.string().required(),
    });

    const checkDetails = {
      name: req.body.name,
      contactNumber: req.body.contactNumber,
      emailId: req.body.emailId,
      password: req.body.password,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 200;
        result.message = err.details[0].message;
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
          utils.MODEL.admin,
          adminQuery
        );

        try {
          if (adminDetails != null) {
            let query1 = {
              emailId: req.body.email,
            };
            let query2 = {
              contactNumber: req.body.contactNumber,
            };
            let agencyMail = await utils.MODEL_ORM.findOne(
              utils.MODEL.admin,
              query1
            );
            let agencyPhone = await utils.MODEL_ORM.findOne(
              utils.MODEL.admin,
              query2
            );
            if (agencyMail == null) {
              if (agencyPhone == null) {
                let planetext = req.body.password;
                let encrypted = await utils.ENCRYPTION.passwordEncryption(
                  planetext
                );
                console.log("encrypted ", encrypted);

                const agencyDetails = {
                  name: req.body.name,
                  contactNumber: req.body.contactNumber,
                  emailId: req.body.emailId,
                  password: req.body.password,
                  address: req.body.address,
                  city: req.body.city,
                  state: req.body.state,
                  zip: req.body.zip,
                };

                agencyDetails.password = encrypted;

                let details = await utils.MODEL_ORM.create(
                  utils.MODEL.agencies,
                  agencyDetails
                );
                if (details) {
                  result.success = true;
                  status = 201;
                  result.message = `Success`;
                  result.status = status;
                  result.data = { email: req.body.email };

                  res.status(status).send(result);
                } else {
                  result.success = false;
                  status = 200;
                  result.message = `Failed`;
                  result.status = status;
                  result.data = { email: req.body.email };
                  console.log(result);
                  res.status(status).send(result);
                }
              } else {
                result.success = false;
                status = 200;
                result.message = `Phone number already found`;
                result.status = status;
                result.data = { email: req.body.contactNumber };
                console.log(result);
                res.status(status).send(result);
              }
            } else {
              result.success = false;
              status = 200;
              result.message = `Email already found`;
              result.status = status;
              result.data = { email: req.body.email };
              console.log(result);
              res.status(status).send(result);
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Admin with this id : ${payload.user} not found`
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

  //================Update agency======================================
  updateAgency: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        let query1 = {
          emailId: req.body.email,
        };
        let query2 = {
          contactNumber: req.body.contactNumber,
        };
        let agencyMail = await utils.MODEL_ORM.findOne(
          utils.MODEL.admin,
          query1
        );
        let agencyPhone = await utils.MODEL_ORM.findOne(
          utils.MODEL.admin,
          query2
        );
        if (agencyMail == null) {
          if (agencyPhone == null) {
            let planetext = req.body.password;
            let encrypted = await utils.ENCRYPTION.passwordEncryption(
              planetext
            );
            console.log("encrypted ", encrypted);

            const agencyDetails = {
              name: req.body.name,
              contactNumber: req.body.contactNumber,
              emailId: req.body.emailId,
              password: req.body.password,
              address: req.body.address,
              city: req.body.city,
              state: req.body.state,
              zip: req.body.zip,
            };

            agencyDetails.password = encrypted;

            let updateQuery = [
              {
                _id: req.body._id,
              },
              {
                $set: agencyDetails,
              },
              {
                w: 1,
              },
            ];

            let details = await utils.MODEL_ORM.update(
              utils.MODEL.agencies,
              updateQuery
            );
            if (details.nModified) {
              result.success = true;
              status = 201;
              result.message = `Success`;
              result.status = status;
              result.data = { email: req.body.email };

              res.status(status).send(result);
            } else {
              result.success = false;
              status = 200;
              result.message = `Failed`;
              result.status = status;
              result.data = { email: req.body.email };
              console.log(result);
              res.status(status).send(result);
            }
          } else {
            result.success = false;
            status = 200;
            result.message = `Phone number already found`;
            result.status = status;
            result.data = { email: req.body.contactNumber };
            console.log(result);
            res.status(status).send(result);
          }
        } else {
          result.success = false;
          status = 200;
          result.message = `Email already found`;
          result.status = status;
          result.data = { email: req.body.email };
          console.log(result);
          res.status(status).send(result);
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },
  //================Get agency details======================================
  getAgencyDetails: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { _id: req.params.id };

        let agencyDetails = await utils.MODEL_ORM.findOne(
          utils.MODEL.agencies,
          query
        );

        if (agencyDetails) {
          logger.info("agencyDetails found successfully --", agencyDetails);

          let encPass = agencyDetails.password;

          let decPass = await utils.DECRYPTION.passwordDecryption(encPass);
          agencyDetails.password = decPass;
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: agencyDetails,
            },
          });
        } else {
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All user details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  // Activate/Deactivate agency ===================================
  activateDeactivateAgency: async (req, res) => {
    const schema = Joi.object().keys({
      id: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      id: req.body.id,
      status: req.body.status,
    };
    console.log(checkDetails);

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          //find admin details first....

          let adminQuery = {
            _id: payload.user,
          };

          let adminDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.admin,
            adminQuery
          );

          if (adminDetails != null) {
            let verifyQuery = [
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

            let userEmailUpdate = await utils.MODEL_ORM.update(
              utils.MODEL.agencies,
              verifyQuery
            );

            if (userEmailUpdate.nModified) {
              logger.info(`Success`);
              return res.status(200).json({
                success: true,
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
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
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Admin email verification error : ", e);
          return res.status(500).json({
            success: false,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  // Block/Unblock user ===================================
  blockUnblockUser: async (req, res) => {
    const schema = Joi.object().keys({
      id: Joi.string().required(),
      status: Joi.boolean().required(),
    });

    const checkDetails = {
      id: req.body.id,
      status: req.body.status,
    };
    console.log(checkDetails);

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          //find admin details first....

          let adminQuery = {
            _id: payload.user,
          };

          let adminDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.admin,
            adminQuery
          );

          if (adminDetails != null) {
            let query = [
              {
                _id: req.body.id,
              },
              {
                $set: {
                  blocked: req.body.status,
                },
              },
              {
                w: 1,
              },
            ];

            let userBlockedUpdate = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              query
            );

            if (userBlockedUpdate.nModified) {
              logger.info(`Success`);
              return res.status(200).json({
                success: true,
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
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
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Admin email verification error : ", e);
          return res.status(500).json({
            success: false,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  // Delete user ===================================
  deleteUser: async (req, res) => {
    const schema = Joi.object().keys({
      id: Joi.string().required(),
    });

    const checkDetails = {
      id: req.body.id,
    };
    console.log(checkDetails);

    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("error", err.details[0].message);
        return res.status(200).json({
          success: false,
          data: {
            msg: err.details[0].message,
            results: null,
          },
        });
      } else {
        try {
          const payload = req.decoded;
          //find admin details first....

          let adminQuery = {
            _id: payload.user,
          };

          let adminDetails = await utils.MODEL_ORM.findOne(
            utils.MODEL.admin,
            adminQuery
          );

          if (adminDetails != null) {
            let query = {
              _id: req.body.id,
            };

            let userDelete = await utils.MODEL_ORM.delete(
              utils.MODEL.users,
              query
            );

            if (userDelete) {
              logger.info(`Success`);
              return res.status(200).json({
                success: true,
                data: {
                  msg: `Success`,
                  results: null,
                },
              });
            } else {
              return res.status(200).json({
                success: false,
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
              data: {
                msg: `Un-authorized access`,
                results: null,
              },
            });
          }
        } catch (e) {
          logger.error("Admin email verification error : ", e);
          return res.status(500).json({
            success: false,
            data: {
              msg: e.message,
              results: null,
            },
          });
        }
      }
    });
  },

  //================Add membership======================================
  addMembership: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      months: Joi.number().required(),
      cost: Joi.number().required(),
      off: Joi.number().required(),
      perMonth: Joi.number().required(),
    });

    const checkDetails = {
      name: req.body.name,
      months: req.body.months,
      cost: req.body.cost,
      off: req.body.off,
      perMonth: req.body.perMonth,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 200;
        result.message = err.details[0].message;
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
          utils.MODEL.admin,
          adminQuery
        );

        try {
          if (adminDetails != null) {
            const newMembership = {
              name: req.body.name,
              months: req.body.months,
              cost: req.body.cost,
              off: req.body.off,
              perMonth: req.body.perMonth,
            };

            let details = await utils.MODEL_ORM.create(
              utils.MODEL.membership,
              newMembership
            );
            if (details) {
              result.success = true;
              status = 201;
              result.message = `Success`;
              result.status = status;
              result.data = details;

              res.status(status).send(result);
            } else {
              result.success = false;
              status = 200;
              result.message = `Failed`;
              result.status = status;
              result.data = details;
              console.log(result);
              res.status(status).send(result);
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Admin with this id : ${payload.user} not found`
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
  //================Get All memberships======================================
  getAllMemberships: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = {};
        let selected = " -__v";
        let populate = [];
        let sort = { createdAt: 1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.membership,
          query,
          selected,
          populate,
          sort
        );

        if (allUserDetails.length > 0) {
          logger.info(
            "All membership Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All memberships details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  //================Get membership details======================================
  getMembershipDetails: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { _id: req.params.id };

        let agencyDetails = await utils.MODEL_ORM.findOne(
          utils.MODEL.membership,
          query
        );

        if (agencyDetails) {
          logger.info("membership found successfully --", agencyDetails);

          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: agencyDetails,
            },
          });
        } else {
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get single membership details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //===============update membership==================================

  updateMembershipPrice: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = [
          {
            _id: req.body._id,
          },
          {
            $set: {
              currency: req.body.currency,
              off: req.body.off,
              cost: req.body.cost,
              perMonth: req.body.perMonth,
            },
          },
          {
            w: 1,
          },
        ];

        let agencyDetails = await utils.MODEL_ORM.update(
          utils.MODEL.membership,
          query
        );

        if (agencyDetails.nModified) {
          logger.info("membership price updated --", agencyDetails);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Failed`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get single membership details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Add recharge======================================
  addRecharge: async (req, res) => {
    //validation
    const schema = Joi.object().keys({
      amount: Joi.number().required(),
      dimonds: Joi.number().required(),
      currency: Joi.string().required(),
    });

    const checkDetails = {
      amount: req.body.amount,
      dimonds: req.body.dimonds,
      currency: req.body.currency,
    };
    Joi.validate(checkDetails, schema, async (err, value) => {
      if (err) {
        // send a 200 error response if validation fails
        console.log("Validataion error", err.details[0].message);
        let result = {};
        result.success = false;
        let status = 200;
        result.message = err.details[0].message;
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
          utils.MODEL.admin,
          adminQuery
        );

        try {
          if (adminDetails != null) {
            const duplicateQuery = {
              amount: req.body.amount,
              dimonds: req.body.dimonds,
              currency: req.body.currency,
            };
            let dupDetails = await utils.MODEL_ORM.findOne(
              utils.MODEL.recharge,
              duplicateQuery
            );
            if (dupDetails) {
              result.success = false;
              status = 200;
              result.message = `Recharge details already added`;
              result.status = status;
              result.data = dupDetails;
              console.log(result);
              res.status(status).send(result);
            } else {
              const newRecharge = {
                amount: req.body.amount,
                dimonds: req.body.dimonds,
                currency: req.body.currency,
              };

              let details = await utils.MODEL_ORM.create(
                utils.MODEL.recharge,
                newRecharge
              );
              if (details) {
                result.success = true;
                status = 201;
                result.message = `Success`;
                result.status = status;
                result.data = details;

                res.status(status).send(result);
              } else {
                result.success = false;
                status = 200;
                result.message = `Failed`;
                result.status = status;
                result.data = details;
                console.log(result);
                res.status(status).send(result);
              }
            }
          } else {
            //if admin with this _id not found

            logger.info(
              `unauthorized : Admin with this id : ${payload.user} not found`
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
  //================Update recharge======================================
  updateRecharge: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        let query = [
          {
            _id: req.body._id,
          },
          {
            $set: {
              dimonds: req.body.dimonds,
              amount: req.body.amount,
              currency: req.body.currency,
            },
          },
          {
            w: 1,
          },
        ];

        let rechargeDetails = await utils.MODEL_ORM.update(
          utils.MODEL.recharge,
          query
        );

        if (rechargeDetails.nModified) {
          logger.info("recharge  updated --", rechargeDetails);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          return res.status(200).json({
            success: false,
            data: {
              msg: `Failed`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },

  //================Delete recharge======================================
  deleteRecharge: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        let query = {
          _id: req.body.id,
        };

        let rechargeDetails = await utils.MODEL_ORM.delete(
          utils.MODEL.recharge,
          query
        );

        if (rechargeDetails) {
          logger.info("delete recharge --", rechargeDetails);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Failed`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },
  //================Get All recharge======================================
  getAllRecharges: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = {};
        let selected = " -__v";
        let populate = [];
        let sort = { createdAt: 1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.recharge,
          query,
          selected,
          populate,
          sort
        );

        if (allUserDetails.length > 0) {
          logger.info(
            "All recharges Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All recharge details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  //================Get recharge details======================================
  getRechargeDetails: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { _id: req.params.id };

        let agencyDetails = await utils.MODEL_ORM.findOne(
          utils.MODEL.recharge,
          query
        );

        if (agencyDetails) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: agencyDetails,
            },
          });
        } else {
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get single recharge details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },

  //================Add charge======================================
  addCharge: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        const query = {
          category: req.body.category,
          type: req.body.type,
        };
        let details1 = await utils.MODEL_ORM.create(utils.MODEL.charges, query);

        if (details1) {
          result.success = false;
          status = 200;
          result.message = `Duplicate`;
          result.status = status;
          result.data = null;
          res.status(status).send(result);
        } else {
          const newCharge = {
            category: req.body.category,
            type: req.body.type,
            userSpend: { amount: req.body.userSpend },
            hostReceive: { amount: req.body.hostReceive },
          };

          let details = await utils.MODEL_ORM.create(
            utils.MODEL.charges,
            newCharge
          );
          if (details) {
            result.success = true;
            status = 201;
            result.message = `Success`;
            result.status = status;
            result.data = details;

            res.status(status).send(result);
          } else {
            result.success = false;
            status = 200;
            result.message = `Failed`;
            result.status = status;
            result.data = details;
            console.log(result);
            res.status(status).send(result);
          }
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },

  //================Update recharge======================================
  updateCharge: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        let query = [
          {
            _id: req.body._id,
          },
          {
            $set: {
              category: req.body.category,
              type: req.body.type,
              "userSpend.amount": req.body.dimonds,
              "hostReceive.amount": req.body.points,
            },
          },
          {
            w: 1,
          },
        ];

        let chargeDetails = await utils.MODEL_ORM.update(
          utils.MODEL.charges,
          query
        );

        if (chargeDetails.nModified) {
          logger.info("charge  updated --", chargeDetails);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          return res.status(200).json({
            success: false,
            data: {
              msg: `Failed`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },

  //================Delete recharge======================================
  deleteCharge: async (req, res) => {
    let result = {};
    let status = 200;

    const payload = req.decoded;
    //find admin details first....

    let adminQuery = {
      _id: payload.user,
    };

    let adminDetails = await utils.MODEL_ORM.findOne(
      utils.MODEL.admin,
      adminQuery
    );

    try {
      if (adminDetails != null) {
        let query = {
          _id: req.body.id,
        };

        let chargeDetails = await utils.MODEL_ORM.delete(
          utils.MODEL.charges,
          query
        );

        if (chargeDetails) {
          logger.info("delete charge --", chargeDetails);
          return res.status(200).json({
            success: true,
            data: {
              msg: `Success`,
              results: null,
            },
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Failed`,
              results: [],
            },
          });
        }
      } else {
        //if admin with this _id not found

        logger.info(
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      result.success = false;
      status = 500;
      result.status = status;
      result.message = e;
      result.data = {};
      res.status(status).send(result);
    }
  },
  //================Get All charges======================================
  getAllCharges: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = {};
        let selected = " -__v";
        let populate = [];
        let sort = { createdAt: 1 };
        let allUserDetails = await utils.MODEL_ORM.findAll(
          utils.MODEL.charges,
          query,
          selected,
          populate,
          sort
        );

        if (allUserDetails.length > 0) {
          logger.info(
            "All charges Details found successfully --",
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
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get All charge details error : ", e);

      return res.status(500).json({
        success: false,
        data: {
          msg: e.message,
          results: null,
        },
      });
    }
  },
  //================Get charge details======================================
  getChargeDetails: async (req, res) => {
    try {
      const payload = req.decoded;
      let adminQuery = {
        _id: payload.user,
      };

      let adminDetails = await utils.MODEL_ORM.findOne(
        utils.MODEL.admin,
        adminQuery
      );

      if (adminDetails != null) {
        let query = { _id: req.params.id };

        let agencyDetails = await utils.MODEL_ORM.findOne(
          utils.MODEL.charges,
          query
        );

        if (agencyDetails) {
          return res.status(200).json({
            success: true,
            data: {
              msg: `Records found`,
              results: agencyDetails,
            },
          });
        } else {
          return res.status(200).json({
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
          `unauthorized : Admin with this id : ${payload.user} not found`
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
      logger.error("Get single charge details error : ", e);

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

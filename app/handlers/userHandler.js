const utils = require("./../utils");
var config = require("../../config");

module.exports = {
  isUserEmailVerified: async (req, res, next) => {
    const payload = req.body;
    const emailId = payload.emailId;
    const contactNumber = payload.contactNumber;

    try {
      let query = null;

      if (emailId) {
        query = {
          emailId: emailId,
        };
      } else if (contactNumber) {
        query = {
          contactNumber: contactNumber,
        };
      }
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let isEmailVerified = user.emailVerified;
        if (isEmailVerified) {
          next();
        } else {
          res.status(401).json({
            success: false,
            code: 401,
            message: "Email not verified",
            data: {
              results: null,
              msg: "Email not verified",
            },
          });
        }
      } else {
        res.status(404).json({
          success: false,
          code: 404,
          message: "User details not found",
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
  isUserPhoneVerified: async (req, res, next) => {
    const payload = req.body;
    const emailId = payload.emailId;
    const contactNumber = payload.contactNumber;

    try {
      let query = null;

      if (emailId) {
        query = {
          emailId: emailId,
        };
      } else if (contactNumber) {
        query = {
          contactNumber: contactNumber,
        };
      }
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let isPhoneVerified = user.phoneVerified;
        if (isPhoneVerified) {
          next();
        } else {
          res.status(401).json({
            success: false,
            code: 401,
            message: "Phone number not verified",
            data: {
              results: null,
              msg: "Phone number not verified",
            },
          });
        }
      } else {
        res.status(404).json({
          success: false,
          code: 404,
          message: "User details not found",
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
  isHost: async (req, res, next) => {
    const payload = req.decoded;
    const userId = payload._id;

    try {
      let query = {
        _id: userId,
      };
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let ishost = user.host;
        if (ishost) {
          next();
        } else {
          res.status(401).json({
            success: false,
            code: 401,
            message: "Only Host can upload!",
            data: {
              results: null,
              msg: "Only host can upload!",
            },
          });
        }
      } else {
        res.status(404).json({
          success: false,
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
  isBlocked: async (req, res, next) => {
    const payload = req.decoded;
    const userId = payload._id;

    try {
      let query = {
        _id: userId,
      };
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let userBlocked = user.blocked;
        if (userBlocked) {
          res.status(401).json({
            success: false,
            code: 401,
            message: "Blocked!\n\nPlease contact Admin",
            data: {
              results: null,
              msg: "Blocked!\n\nPlease contact Admin",
            },
          });
        } else {
          next();
        }
      } else {
        res.status(404).json({
          success: false,
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
  checkNormalPicsLength: async (req, res, next) => {
    const payload = req.decoded;
    const userId = payload._id;

    try {
      let query = {
        _id: userId,
      };
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let userNormalImages = user.normalPics.length;
        if (userNormalImages >= 5) {
          res.status(405).json({
            success: false,
            code: 405,
            message:
              "Please delete any of you normal pic before uploading new pic",
            data: {
              results: null,
              msg:
                "Please delete any of you normal pic before uploading new pic",
            },
          });
        } else {
          next();
        }
      } else {
        res.status(404).json({
          success: false,
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
  checkSecretPicsLength: async (req, res, next) => {
    const payload = req.decoded;
    const userId = payload._id;

    try {
      let query = {
        _id: userId,
      };
      let user = await utils.MODEL_ORM.findOne(utils.MODEL.users, query);

      if (user != undefined) {
        let userSecretImages = user.secretPics.length;
        if (userSecretImages >= 5) {
          res.status(405).json({
            success: false,
            code: 405,
            message:
              "Please delete any of you secret pic before uploading new pic",
            data: {
              results: null,
              msg:
                "Please delete any of you secret pic before uploading new pic",
            },
          });
        } else {
          next();
        }
      } else {
        res.status(404).json({
          success: false,
          data: {
            results: null,
            msg: "User details not found",
          },
        });
      }
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      res.status(500).json({
        success: false,
        code: 500,
        message: "DB error",
        data: {
          results: null,
          msg: err.message,
        },
      });
    }
  },
};

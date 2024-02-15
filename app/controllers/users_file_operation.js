const utils = require("../utils");



module.exports = {
  //========================================================================== users profile image ========================================================

  uploadUserProfileImage: async (req, res) => {
    console.log("--- req.fileKey image ", req.fileKey);

    const fileKey = req.fileKey;

    const payload = req.decoded;
    console.log("PAYLOAD", payload);

    let result = {};
    try {
      let query1 = [
        {
           _id: payload._id,
        },
        {
          $set: {
            userImage: "",
          },
        },
        {
          w: 1,
        },
      ];

      let updateNewsImage = await utils.MODEL_ORM.update(
        utils.MODEL.users,
        query1
      );

      let query2 = [
        {
           _id: payload._id,
        },
        {
          $set: {
            userImage: fileKey,
          },
        },
        {
          w: 1,
        },
      ];

      let finalUpdate = await utils.MODEL_ORM.update(utils.MODEL.users, query2);

      if (finalUpdate.nModified == 1) {
        return res.status(200).json({
          success: true,
          code: 200,
          message: `File uploaded `,
          data: {
            msg: `File updated to db`,
            results: fileKey,
          },
        });
      } else {
        return res.status(424).json({
          success: false,
          code: 424,
          message: `File not uploaded `,
          data: {
            msg: `File not updated to db`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },

  //========================================================================== users audio upload ========================================================
  uploadGreetingAudio: async (req, res) => {
    console.log("--- req.fileKey image ", req.fileKey);

    const fileKey = req.fileKey;

    const payload = req.decoded;
    console.log("PAYLOAD", payload);

    let result = {};
    try {
      let query1 = [
        {
           _id: payload._id,
        },
        {
          $set: {
            "greetings.audio": "",
          },
        },
        {
          w: 1,
        },
      ];

      let updateNewsImage = await utils.MODEL_ORM.update(
        utils.MODEL.users,
        query1
      );

      let query2 = [
        {
           _id: payload._id,
        },
        {
          $set: {
            "greetings.audio": fileKey,
          },
        },
        {
          w: 1,
        },
      ];

      let finalUpdate = await utils.MODEL_ORM.update(utils.MODEL.users, query2);

      if (finalUpdate.nModified == 1) {
        return res.status(200).json({
          success: true,
          code: 200,
          message: `File uploaded `,
          data: {
            msg: `File uploaded`,
            results: null,
          },
        });
      } else {
        return res.status(424).json({
          success: false,
          code: 424,
          message: `File not updated to db `,
          data: {
            msg: `File not updated to db`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },
  //========================================================================== users multiple normal pics upload ========================================================
  uploadNormalImages: async (req, res) => {
    console.log("--- req.fileKeys normal image ", req.fileKeys);

    const fileKeys = req.fileKeys;

    const payload = req.decoded;
    console.log("PAYLOAD", payload);

    let result = {};
    try {
      let map = await fileKeys.map(async (fileKey) => {
        let query2 = [
          {
            _id: payload._id,
          },
          {
            $push: {
              normalPics: fileKey,
            },
          },
          {
            w: 1,
          },
        ];

        let finalUpdate = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          query2
        );
      });

      Promise.all(map).then((final) => {
        return res.status(200).json({
          success: true,
          code: 200,
          message: `File uploaded `,
          data: {
            msg: `Files uploaded`,
            results: null,
          },
        });
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },
  //========================================================================== users multiple secret pics upload ========================================================
  uploadSecretImages: async (req, res) => {
    console.log("--- req.fileKeys secret image ", req.fileKeys);

    const fileKeys = req.fileKeys;

    const payload = req.decoded;
    console.log("PAYLOAD", payload);

    let result = {};
    try {
      let map = await fileKeys.map(async (fileKey) => {
        let query2 = [
          {
            _id: payload._id,
          },
          {
            $push: {
              secretPics: fileKey,
            },
          },
          {
            w: 1,
          },
        ];

        let finalUpdate = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          query2
        );
      });

      Promise.all(map).then((final) => {
        return res.status(200).json({
          success: true,
          code: 200,
          message: `File uploaded `,
          data: {
            msg: `Files uploaded`,
            results: null,
          },
        });
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },

  //========================================================================== user profile pic delete ========================================================

  deleteUserProfileImage: async (req, res) => {
    let result = {};
    const payload = req.decoded;

    console.log("PAYLOAD", payload);

    try {
      let findUserQuery = {
         _id: payload._id,
      };

      let user = await utils.MODEL_ORM.findOne(
        utils.MODEL.users,
        findUserQuery
      );
      let key = user.userImage;

      console.log("--- key ", key);

      const fileDelete = await utils.AWS_FILE_OPERATION.fileDelete(key);

      console.log("--- fileDelete response", fileDelete);

      if (typeof fileDelete == "object") {
        console.log("its a object...success....");

        let query = [
          {
            _id: payload._id,
          },
          {
            $set: {
              userImage: "",
            },
          },
          {
            w: 1,
          },
        ];

        let updateNewsImage = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          query
        );

        if (updateNewsImage.nModified) {
          return res.status(200).json({
            success: true,
            code: 200,
            message: `File deleted `,
            data: {
              msg: `File deleted `,
              results: null,
            },
          });
        } else {
          return res.status(424).json({
            success: false,
            code: 424,
            message: `File not deleted from db`,
            data: {
              msg: `File not deleted from db`,
              results: null,
            },
          });
        }
      } else {
        console.log("its not a object...failure....");
        return res.status(424).json({
          success: false,
          code: 424,
          message: `File not deleted from s3`,
          data: {
            msg: `File not deleted from s3`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },

  //========================================================================== user normal pic delete ========================================================

  deleteUserNormalImage: async (req, res) => {
    let result = {};
    const payload = req.decoded;

    console.log("PAYLOAD", payload);

    try {
      let key = req.body.url;
      if (key) {
        let findUserQuery = {
          _id: payload._id,
        };

        let user = await utils.MODEL_ORM.findOne(
          utils.MODEL.users,
          findUserQuery
        );
        if (user) {
          console.log("--- key ", key);

          const fileDelete = await utils.AWS_FILE_OPERATION.fileDelete(key);

          console.log("--- fileDelete response", fileDelete);

          if (typeof fileDelete == "object") {
            console.log("its a object...success....");

            let query = [
              {
                _id: payload._id,
              },
              {
                $pull: {
                  normalPics: key,
                },
              },
              {
                w: 1,
              },
            ];

            let updateNewsImage = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              query
            );

            if (updateNewsImage.nModified) {
              return res.status(200).json({
                success: true,
                code: 200,
                message: `File deleted `,
                data: {
                  msg: `File deleted `,
                  results: null,
                },
              });
            } else {
              return res.status(424).json({
                success: false,
                code: 424,
                message: `File not deleted from db`,
                data: {
                  msg: `File not deleted from db`,
                  results: null,
                },
              });
            }
          } else {
            console.log("its not a object...failure....");
            return res.status(424).json({
              success: false,
              code: 424,
              message: `File not deleted from s3`,
              data: {
                msg: `File not deleted from s3`,
                results: null,
              },
            });
          }
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            code: 404,
            message: `User details not found`,
            data: {
              msg: `User details not found`,
              results: null,
            },
          });
        }
      } else {
        console.log("File url not found");
        return res.status(200).json({
          success: false,
          code: 200,
          message: `Please send file URL`,
          data: {
            msg: `Please send file URL`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },

  //========================================================================== user secret pic delete ========================================================

  deleteUserSecretImage: async (req, res) => {
    let result = {};
    const payload = req.decoded;

    console.log("PAYLOAD", payload);

    try {
      let key = req.body.url;
      if (key) {
        let findUserQuery = {
           _id: payload._id,
        };

        let user = await utils.MODEL_ORM.findOne(
          utils.MODEL.users,
          findUserQuery
        );
        if (user) {
          console.log("--- key ", key);

          const fileDelete = await utils.AWS_FILE_OPERATION.fileDelete(key);

          console.log("--- fileDelete response", fileDelete);

          if (typeof fileDelete == "object") {
            console.log("its a object...success....");

            let query = [
              {
                 _id: payload._id,
              },
              {
                $pull: {
                  secretPics: key,
                },
              },
              {
                w: 1,
              },
            ];

            let updateNewsImage = await utils.MODEL_ORM.update(
              utils.MODEL.users,
              query
            );

            if (updateNewsImage.nModified) {
              return res.status(200).json({
                success: true,
                code: 200,
                message: `File deleted `,
                data: {
                  msg: `File deleted `,
                  results: null,
                },
              });
            } else {
              return res.status(424).json({
                success: false,
                code: 424,
                message: `File not deleted from db`,
                data: {
                  msg: `File not deleted from db`,
                  results: null,
                },
              });
            }
          } else {
            console.log("its not a object...failure....");
            return res.status(424).json({
              success: false,
              code: 424,
              message: `File not deleted from s3`,
              data: {
                msg: `File not deleted from s3`,
                results: null,
              },
            });
          }
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            code: 404,
            message: `User details not found`,
            data: {
              msg: `User details not found`,
              results: null,
            },
          });
        }
      } else {
        console.log("File url not found");
        return res.status(200).json({
          success: false,
          code: 200,
          message: `Please send file URL`,
          data: {
            msg: `Please send file URL`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },

  //========================================================================== user audio delete ========================================================

  deleteUserAudio: async (req, res) => {
    let result = {};
    const payload = req.decoded;

    console.log("PAYLOAD", payload);

    try {
      let findUserQuery = {
         _id: payload._id,
      };

      let user = await utils.MODEL_ORM.findOne(
        utils.MODEL.users,
        findUserQuery
      );
      let key = user.greetings.audio;

      console.log("--- key ", key);

      const fileDelete = await utils.AWS_FILE_OPERATION.fileDelete(key);

      console.log("--- fileDelete response", fileDelete);

      if (typeof fileDelete == "object") {
        console.log("its a object...success....");

        let query = [
          {
             _id: payload._id,
          },
          {
            $set: {
              "greetings.audio": "",
            },
          },
          {
            w: 1,
          },
        ];

        let updateNewsImage = await utils.MODEL_ORM.update(
          utils.MODEL.users,
          query
        );

        if (updateNewsImage.nModified) {
          return res.status(200).json({
            success: true,
            code: 200,
            message: `File deleted `,
            data: {
              msg: `File deleted `,
              results: null,
            },
          });
        } else {
          return res.status(424).json({
            success: false,
            code: 424,
            message: `File not deleted from db`,
            data: {
              msg: `File not deleted from db`,
              results: null,
            },
          });
        }
      } else {
        console.log("its not a object...failure....");
        return res.status(424).json({
          success: false,
          code: 424,
          message: `File not deleted from s3`,
          data: {
            msg: `File not deleted from s3`,
            results: null,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message,
        data: {
          msg: err.message,
          results: null,
        },
      });
    }
  },
};

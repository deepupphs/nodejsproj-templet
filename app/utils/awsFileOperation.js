// Load dependencies
const fs = require("fs");
const AWS = require("aws-sdk");
const config = require("../../config");
const curdOpe = require("./curdOperations");
const model_links = require("./../models");

//const uploadPath = require("./../Uploads");

AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
});

const s3 = new AWS.S3({
  signatureVersion: config.signatureVersion,
  region: config.awsRegion,
});

module.exports = {
  awsUserImageOperationDuringSignUp: async (req, res, next) => {
    console.log("--- req.file image ", req.file);
    console.log("--- req.body image ", req.body);
    if (req.file) {
      try {
        // Read in the file, convert it to base64, store to S3
        let path = "./Uploads/" + req.file.filename;
        console.log(path);

        fs.readFile(path, function (err, data) {
          if (err) {
            throw err;
          }
          let keey1 = "userImage/" + req.file.filename;
          let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
          console.log("New Image file name and path for s3===", keey2);

          let base64data = new Buffer.from(data, "binary");
          console.log("base64data", base64data);
          s3.putObject(
            {
              Bucket: config.awsBucket,
              Key: keey2,
              Body: base64data,
            },
            function (resp) {
              // console.log(arguments);
              console.log(
                "User Pic during signup Successfully uploaded to s3 bucket."
              );
              // Deleted user Pic in local directory

              fs.unlink(path, function (err) {
                if (err) {
                  console.log("User Pic in local directory not deleted.");
                  return res.status(500).json({
                    success: false,
                    code: 500,
                    message: err.message,
                    data: {},
                  });
                }

                console.log(
                  "Successfully deleted user Pic in local directory."
                );

                //Update image url in DB

                let fileKeey1 =
                  config.awsS3BaseUrl + "/" + "userImage/" + req.file.filename;
                let fileKeey2 = fileKeey1.replace(/ /g, "").replace(/_/g, "");
                req.fileKey = fileKeey2;
                next();
              });
            }
          );
        });
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        return res.status(500).json({
          success: false,
          code: 500,
          message: err.message,
          data: {},
        });
      }
    } else {
      // return res.status(200).json({
      //   success: false,
      //   code: 200,
      //   message: "Select file to upload",
      //   data: {},
      // });
      req.fileKey = "";
      next();
    }
  },
  awsUserImageOperation: async (req, res, next) => {
    console.log("--- req.file image ", req.file);
    if (req.file) {
      let payload = req.decoded;
      console.log("PAYLOAD", payload);
      try {
        let query = {
          _id: payload._id,
        };
        let user = await curdOpe.findOne(model_links.users, query);

        if (user != null) {
          let image = user.userImage;

          if (image.length == 0 || image == "") {
            console.log("user image url not found");

            // Read in the file, convert it to base64, store to S3
            let path = "./Uploads/" + req.file.filename;
            console.log(path);

            fs.readFile(path, function (err, data) {
              if (err) {
                throw err;
              }
              let keey1 = "userImage/" + req.file.filename;
              let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
              console.log("New Image file name and path for s3===", keey2);

              let base64data = new Buffer.from(data, "binary");
              console.log("base64data", base64data);
              s3.putObject(
                {
                  Bucket: config.awsBucket,
                  Key: keey2,
                  Body: base64data,
                },
                function (resp) {
                  // console.log(arguments);
                  console.log("User Pic Successfully uploaded to s3 bucket.");
                  // Deleted user Pic in local directory

                  fs.unlink(path, function (err) {
                    if (err) {
                      console.log("User Pic in local directory not deleted.");
                      return res.status(500).json({
                        success: false,
                        code: 500,
                        message: err.message,
                        data: {},
                      });
                    }

                    console.log(
                      "Successfully deleted user Pic in local directory."
                    );

                    //Update image url in DB

                    let fileKeey1 =
                      config.awsS3BaseUrl +
                      "/" +
                      "userImage/" +
                      req.file.filename;
                    let fileKeey2 = fileKeey1
                      .replace(/ /g, "")
                      .replace(/_/g, "");
                    req.fileKey = fileKeey2;
                    next();
                  });
                }
              );
            });

            //====================================================================================================
          } else {
            console.log("Image url found for this user");
            let h1 = image.replace(
              "https://golo-app-deploy.s3.us-east-2.amazonaws.com/",
              ""
            );
            let h2 = h1.replace(/ /g, "").replace(/_/g, "");
            console.log("Old Image file name and path in s3====", h2);
            let params11 = {
              Bucket: config.awsBucket,
              Key: h2,
            };
            s3.deleteObject(params11, function (err, data) {
              if (err) {
                console.log(err, err.stack);
                return res.status(500).json({
                  success: false,
                  code: 500,
                  message: err.message,
                  data: {},
                });
              }
              // an error occurred
              else {
                // successful response
                console.log(data);
                if (data) {
                  console.log("User image in s3 bucket deleted");
                } else {
                  console.log("User image in s3 bucket not deleted ");
                }
              }

              // Read in the file, convert it to base64, store to S3
              let path = "./Uploads/" + req.file.filename;
              fs.readFile(path, function (err, data) {
                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    success: false,
                    code: 500,
                    message: err.message,
                    data: {},
                  });
                }

                let keey1 = "userImage/" + req.file.filename;
                let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
                console.log("New Image file name and path for s3===", keey2);

                let base64data = new Buffer.from(data, "binary");
                //console.log("base64data", base64data);
                // upload new image to S3
                s3.putObject(
                  {
                    Bucket: config.awsBucket,
                    Key: keey2,
                    Body: base64data,
                  },
                  function (resp) {
                    // console.log(arguments);
                    console.log(
                      "User new Pic Successfully uploaded to s3 and updated"
                    );
                    // Deleted user Pic in local directory
                    fs.unlink(path, function (err) {
                      if (err) {
                        console.log("User Pic in local directory not deleted.");
                        throw err;
                      }

                      console.log(
                        "Successfully deleted user Pic in local directory."
                      );

                      // Update the user image URL in DB
                      let fileKeey1 =
                        config.awsS3BaseUrl +
                        "/" +
                        "userImage/" +
                        req.file.filename;
                      let fileKeey2 = fileKeey1
                        .replace(/ /g, "")
                        .replace(/_/g, "");
                      req.fileKey = fileKeey2;
                      next();
                    });
                  }
                );
              });
            });
          }
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            code: 404,
            message: `User details not found`,
            data: {},
          });
        }
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        return res.status(500).json({
          success: false,
          code: 500,
          message: err.message,
          data: {},
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        code: 200,
        message: "Select file to upload",
        data: {},
      });
    }
  },

  awsUserGreetingAudioOperation: async (req, res, next) => {
    console.log("--- req.file audio ", req.file);
    if (req.file) {
      let payload = req.decoded;
      console.log("PAYLOAD", payload);
      try {
        let query = {
          _id: payload._id,
        };
        let user = await curdOpe.findOne(model_links.users, query);

        if (user != null) {
          let audio = user.greetings.audio;

          if (audio.length == 0 || audio == "") {
            console.log("user audio url not found");

            // Read in the file, convert it to base64, store to S3
            let path = "./Uploads/" + req.file.filename;
            console.log(path);

            fs.readFile(path, function (err, data) {
              if (err) {
                throw err;
              }
              let keey1 = "userAudio/" + req.file.filename;
              let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
              console.log("New audio file name and path for s3===", keey2);

              let base64data = new Buffer.from(data, "binary");
              console.log("base64data", base64data);
              s3.putObject(
                {
                  Bucket: config.awsBucket,
                  Key: keey2,
                  Body: base64data,
                },
                function (resp) {
                  // console.log(arguments);
                  console.log("User audio Successfully uploaded to s3 bucket.");
                  // Deleted user Pic in local directory

                  fs.unlink(path, function (err) {
                    if (err) {
                      console.log("User audio in local directory not deleted.");
                      return res.status(500).json({
                        success: false,
                        data: {
                          msg: err.message,
                          results: null,
                        },
                      });
                    }

                    console.log(
                      "Successfully deleted user audio in local directory."
                    );

                    //Update image url in DB

                    let fileKeey1 =
                      config.awsS3BaseUrl +
                      "/" +
                      "userAudio/" +
                      req.file.filename;
                    let fileKeey2 = fileKeey1
                      .replace(/ /g, "")
                      .replace(/_/g, "");
                    req.fileKey = fileKeey2;
                    next();
                  });
                }
              );
            });

            //====================================================================================================
          } else {
            console.log("Audio url found for this user");
            let h1 = audio.replace(
              "https://golo-app-deploy.s3.us-east-2.amazonaws.com/",
              ""
            );
            let h2 = h1.replace(/ /g, "").replace(/_/g, "");
            console.log("Old audio file name and path in s3====", h2);
            let params11 = {
              Bucket: config.awsBucket,
              Key: h2,
            };
            s3.deleteObject(params11, function (err, data) {
              if (err) {
                console.log(err, err.stack);
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
              // an error occurred
              else {
                // successful response
                console.log(data);
                if (data) {
                  console.log("User audio in s3 bucket deleted");
                } else {
                  console.log("User audio in s3 bucket not deleted ");
                }
              }

              // Read in the file, convert it to base64, store to S3
              let path = "./Uploads/" + req.file.filename;
              fs.readFile(path, function (err, data) {
                if (err) {
                  console.log(err);
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

                let keey1 = "userAudio/" + req.file.filename;
                let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
                console.log("New audio file name and path for s3===", keey2);

                let base64data = new Buffer.from(data, "binary");
                //console.log("base64data", base64data);
                // upload new audio to S3
                s3.putObject(
                  {
                    Bucket: config.awsBucket,
                    Key: keey2,
                    Body: base64data,
                  },
                  function (resp) {
                    // console.log(arguments);
                    console.log(
                      "User new audio Successfully uploaded to s3 and updated"
                    );
                    // Deleted user Pic in local directory
                    fs.unlink(path, function (err) {
                      if (err) {
                        console.log(
                          "User audio in local directory not deleted."
                        );
                        throw err;
                      }

                      console.log(
                        "Successfully deleted user audio in local directory."
                      );

                      // Update the user audio URL in DB
                      let fileKeey1 =
                        config.awsS3BaseUrl +
                        "/" +
                        "userAudio/" +
                        req.file.filename;
                      let fileKeey2 = fileKeey1
                        .replace(/ /g, "")
                        .replace(/_/g, "");
                      req.fileKey = fileKeey2;
                      next();
                    });
                  }
                );
              });
            });
          }
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            data: {
              msg: `User details not found`,
              results: null,
            },
          });
        }
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
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
    } else {
      return res.status(424).json({
        success: false,
        code: 424,
        message: "Select file to upload",
        data: {
          msg: `Select file to upload`,
          results: null,
        },
      });
    }
  },

  awsUserMultipleNormalImageOperation: async (req, res, next) => {
    console.log("--- req.files image ", req.files);
    if (req.files.length > 0) {
      let payload = req.decoded;
      console.log("PAYLOAD", payload);
      try {
        let query = {
          _id: payload._id,
        };
        let user = await curdOpe.findOne(model_links.users, query);

        if (user != null) {
          let files = req.files;
          let fileArray = [];

          let map = await files.map(async (file) => {
            let fileName = file.filename;
            // Read in the file, convert it to base64, store to S3
            let path = "./Uploads/" + fileName;
           // console.log(path);
            let fileKeey1 =
            config.awsS3BaseUrl + "/" + "userNormalImage/" + fileName;
          let fileKeey2 =  fileKeey1
            .replace(/ /g, "")
            .replace(/_/g, "");
            console.log("fileKeey2 ", fileKeey2);
             fs.readFile(path,  function (err, data) {
              if (err) {
                throw err;
              }
              let keey1 = "userNormalImage/" + fileName;
              let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
              // console.log(
              //   "New normal Image file name and path for s3===",
              //   keey2
              // );

             
              let base64data = new Buffer.from(data, "binary");
              //console.log("base64data", base64data);
               s3.putObject(
                {
                  Bucket: config.awsBucket,
                  Key: keey2,
                  Body: base64data,
                },
                 function (resp) {
                  // console.log(arguments);
                  console.log(
                    "User normal Pic Successfully uploaded to s3 bucket."
                  );
                 
                }
              );

                 // Deleted user Pic in local directory

                 fs.unlink(path,  async function (err) {
                  if (err) {
                    console.log(
                      "User normal Pic in local directory not deleted.",
                      err
                    );
                    return null;
                  }

                  console.log(
                    "Successfully deleted user normal Pic in local directory."
                  );

                
                  let query2 = [
                    {
                      _id: payload._id,
                    },
                    {
                      $push: {
                        normalPics: fileKeey2,
                      },
                    },
                    {
                      w: 1,
                    },
                  ];
          
                  let finalUpdate = await curdOpe.update(model_links.users, query2);
                 
                });
            })
            });
          Promise.all(map).then(  (final) => {
            console.log("fileArray in aws file ", final)
            req.fileKeys = fileArray;
            next();
          });
         
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            code: 404,
            message: "User details not found",
            data: {
              msg: `User details not found`,
              results: null,
            },
          });
        }
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
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
    } else {
      return res.status(424).json({
        success: false,
        code: 424,
        message: "Select file to upload",
        data: {
          msg: `Select file to upload`,
          results: null,
        },
      });
    }
  },

  awsUserMultipleSecretImageOperation: async (req, res, next) => {
    console.log("--- req.files secret image ", req.files);
    if (req.files.length > 0) {
      let payload = req.decoded;
      //console.log("PAYLOAD", payload);
      try {
        let query = {
          _id: payload._id,
        };
        let user = await curdOpe.findOne(model_links.users, query);

        if (user != null) {
          let files = req.files;
          let fileArray = [];

          let map = await files.map(async (file) => {
            let fileName = file.filename;
            // Read in the file, convert it to base64, store to S3
            let path = "./Uploads/" + fileName;
            console.log(path);
            fs.readFile(path, function (err, data) {
              if (err) {
                throw err;
              }
              let keey1 = "userSecretImage/" + fileName;
              let keey2 = keey1.replace(/ /g, "").replace(/_/g, "");
              console.log(
                "New secret Image file name and path for s3===",
                keey2
              );

              let base64data = new Buffer.from(data, "binary");
              console.log("base64data", base64data);
              s3.putObject(
                {
                  Bucket: config.awsBucket,
                  Key: keey2,
                  Body: base64data,
                },
                function (resp) {
                  // console.log(arguments);
                  console.log(
                    "User secret Pic Successfully uploaded to s3 bucket."
                  );
                  // Deleted user Pic in local directory

                  fs.unlink(path, async function (err) {
                    if (err) {
                      console.log(
                        "User secret Pic in local directory not deleted.",
                        err
                      );
                    }

                    console.log(
                      "Successfully deleted user secret Pic in local directory."
                    );

                    //Update image url in DB

                    let fileKeey1 =
                      config.awsS3BaseUrl + "/" + "userSecretImage/" + fileName;
                    let fileKeey2 = fileKeey1
                      .replace(/ /g, "")
                      .replace(/_/g, "");
                      let query2 = [
                        {
                          _id: payload._id,
                        },
                        {
                          $push: {
                            secretPics: fileKeey2,
                          },
                        },
                        {
                          w: 1,
                        },
                      ];
              
                      let finalUpdate = await curdOpe.update(model_links.users, query2);
                    fileArray.push(fileKeey2);
                  });
                }
              );
            });
          });

          Promise.all(map).then((final) => {
            req.fileKeys = fileArray;
            next();
          });
        } else {
          console.log("User details not found");
          return res.status(404).json({
            success: false,
            data: {
              msg: `User details not found`,
              results: null,
            },
          });
        }
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
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
    } else {
      return res.status(424).json({
        success: false,
        code: 424,
        message: "Select file to upload",
        data: {
          msg: `Select file to upload`,
          results: null,
        },
      });
    }
  },

  fileDelete: async (key) => {
    try {
      console.log("Image url found for this user");
      let h1 = key.replace(
        "https://golo-app-deploy.s3.us-east-2.amazonaws.com/",
        ""
      );
      let h2 = h1.replace(/ /g, "").replace(/_/g, "");
      console.log(" Image file name and path in s3====", h2);
      let params11 = {
        Bucket: "text-app-deploy",
        Key: h2,
      };
      return new Promise(async function (resolve, reject) {
        await s3.deleteObject(params11, function (err, data) {
          // an error occurred
          console.log(data); // successful response
          if (typeof data == "object") {
            console.log(" image in s3 bucket deleted");
            resolve(data);
          } else {
            console.log(" image in s3 bucket not deleted ");
            reject(err);
          }
        });
      });
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
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

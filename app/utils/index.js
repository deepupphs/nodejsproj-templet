"use strict";
const model_links = require("./../models");
const model_wrapper = require("./curdOperations");
const generateUserToken = require("./generateUserToken");
const validateToken = require("./validateToken");
const adminValidateToken = require("./adminValidateToken");
const passwordEncryption = require("./passwordEncryption");
const passwordDecryption = require("./passwordDecryption");
const fileUpload = require("./fileUpload");
const awsFileOperation = require("./awsFileOperation");
const httpRequests = require("./httpRequests");


module.exports = {
  MODEL: model_links,
  MODEL_ORM: model_wrapper,
  GENERATE_TOKEN: generateUserToken,
  VALIDATE_TOKEN: validateToken,
  ADMIN_VALIDATE_TOKEN: adminValidateToken,
  ENCRYPTION: passwordEncryption,
  DECRYPTION: passwordDecryption,
  FILE_UPLOAD: fileUpload,
  AWS_FILE_OPERATION: awsFileOperation,
  HTTP_REQ: httpRequests,
  
};

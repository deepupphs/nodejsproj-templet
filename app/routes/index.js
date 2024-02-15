const admin = require("./admin");
const users = require("./users");
const agency = require("./agency");

module.exports = (router) => {
  admin(router);
  users(router);
  agency(router);
  return router;
};

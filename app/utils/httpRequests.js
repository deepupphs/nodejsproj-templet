const https = require("https");
const axios = require("axios");

module.exports = {
  getBasicTxsForAddress: async (options) => {
    return new Promise(async function (resolve, reject) {
      try {
        console.log(options);

        let request = https.request(options, function (response) {
          response.on("data", function (data) {
            console.log(data);
            resolve(data);
          });
        });
      } catch (error) {
        console.log("http error : ", error);
        reject(error);
      }
    });
  },

  getConfirmedTxsForAddress: async (options) => {
    return new Promise(async function (resolve, reject) {
      try {
        console.log(options);

        let request = https.request(options, function (response) {
          response.on("data", function (data) {
            console.log(data);
            resolve(data);
          });
        });
      } catch (error) {
        console.log("http error : ", error);
        reject(error);
      }
    });
  },

  getData: async (options) => {
    return new Promise(async function (resolve, reject) {
      try {
        console.log(options);

        const response = await axios(options);
        console.log("API response = ", response.data);
        console.log("-----------------------------------------");
        resolve(response.data);
      } catch (error) {
        console.log("axios error : ", error);
        reject(error);
      }
    });
  },
};

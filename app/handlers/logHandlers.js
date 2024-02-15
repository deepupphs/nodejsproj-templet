const winston = require("winston");
const { combine, timestamp, json, printf } = winston.format;
const appName = `GOLO-APP`;

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${appName}] ${level}: ${JSON.stringify(message)}`;
});

const logger = winston.createLogger({
  format: combine(timestamp(), json(), loggerFormat),
  defaultMeta: { service: appName },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.Console(
      {
        level: "info",
        format: combine(timestamp(), json(), loggerFormat),
      },
      {
        level: "error",
        format: combine(timestamp(), json(), loggerFormat),
      }
    ),
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "./logs/info.log",
      level: "info",
    }),
  ],
});

module.exports = logger;

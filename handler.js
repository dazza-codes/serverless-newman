/* jshint esversion: 8 */
/* jshint node: true */

// https://github.com/postmanlabs/newman#api-reference

"use strict";

const config = require("config");
const newman = require("newman");
const { v4: uuidv4 } = require("uuid");
const winston = require("winston");

const logLevel = config.get("logLevel", "info");

// const winstonOptions = {
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   level: logLevel,
//   defaultMeta: { service: "newman" },
//   transports: [new winston.transports.Console()],
// };

const winstonOptions = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  level: logLevel,
  defaultMeta: { service: "newman" },
  transports: [new winston.transports.Console()],
};
const logger = winston.createLogger(winstonOptions);

logger.debug("get config: 'testSuite'");
const testCollection = config.get("testSuite");
logger.debug(testCollection);

const testEnvironmentVariablesConfig = config.get("testEnvironmentVariables");

const getNewmanTestEnvironmentObject = function (testEnvironmentObject) {
  const uuid = uuidv4();
  return {
    id: uuid,
    name: "auto-generated-" + uuid,
    values: Object.keys(testEnvironmentObject).map((environmentKey) => {
      return {
        enabled: true,
        key: environmentKey,
        value: testEnvironmentObject[environmentKey],
        type: "text",
      };
    }),
    _postman_variable_scope: "environment",
    _postman_exported_at: new Date(Date.now()).toISOString(),
    _postman_exported_using: "Postman/7.26.0",
  };
};

module.exports.runNewmanTest = (event, context, callback) => {
  const testEnvironmentVariablesEvent = event.testEnvironmentVariables || {};

  // merge test environment variables from config and event
  const testEnvironmentVariables = Object.assign(
    {},
    testEnvironmentVariablesConfig,
    testEnvironmentVariablesEvent
  );
  const newmanEnv = getNewmanTestEnvironmentObject(testEnvironmentVariables);
  logger.info("environment: ", newmanEnv);

  // TODO: use the env-var to define the test collection file
  const newmanOptions = {
    collection: require("./testsuites/test.postman_collection.json"),
    environment: newmanEnv,
    color: "off",
    reporters: "cli",
    // reporters: ["cli", "winston"],
    // reporter: { winston: winstonOptions },
  };

  logger.info("start newman run");
  newman
    .run(newmanOptions)
    .on("start", function (err, args) {
      logger.info("running a collection...");
    })
    .on("done", function (err, summary) {
      if (err || summary.error) {
        logger.error("error: ", err);
        return {
          statusCode: 500,
          body: summary,
        };
      } else {
        logger.info("collection run completed.");
        logger.info({ summary: summary });

        return {
          statusCode: 200,
          body: summary,
        };
      }
    });
};

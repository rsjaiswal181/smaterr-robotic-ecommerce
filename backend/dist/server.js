"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const start = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.env.port, () => {
        logger_1.logger.info(`Server running in ${env_1.env.nodeEnv} mode on http://localhost:${env_1.env.port}`);
        logger_1.logger.info(`API base path: http://localhost:${env_1.env.port}/api`);
    });
};
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger_1.logger.error(`Uncaught Exception: ${err.stack || err.message}`);
    process.exit(1);
});
start();

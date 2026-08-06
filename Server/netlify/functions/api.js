const serverless = require("serverless-http");
const app = require("../../Server");
const ConnectGoogleSheets = require("../../config/googleSheets");

let isConnected = false;

const serverlessHandler = serverless(app);

module.exports.handler = async (event, context) => {
    if (!isConnected) {
        await ConnectGoogleSheets();
        isConnected = true;
    }
    return serverlessHandler(event, context);
};

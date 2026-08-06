const serverless = require("serverless-http");
const app = require("../../Server");
const ConnectGoogleSheets = require("../../config/googleSheets");

let isConnected = false;

const serverlessHandler = serverless(app);

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

module.exports.handler = async (event, context) => {
    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    try {
        if (!isConnected) {
            await ConnectGoogleSheets();
            isConnected = true;
        }
        return await serverlessHandler(event, context);
    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
};

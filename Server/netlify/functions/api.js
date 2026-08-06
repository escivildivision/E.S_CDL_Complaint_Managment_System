const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

let handler = null;

module.exports.handler = async (event, context) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    // Health check - no Google Sheets needed
    if (event.path === "/health") {
        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({
                success: true,
                message: "Function is alive",
                env: {
                    hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
                    hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
                    hasSheet: !!process.env.SPREADSHEET_ID,
                }
            }),
        };
    }

    try {
        if (!handler) {
            const serverless = require("serverless-http");
            const ConnectGoogleSheets = require("../../config/googleSheets");
            const app = require("../../Server");
            await ConnectGoogleSheets();
            handler = serverless(app, {
                binary: ['application/pdf', '*/*']
            });
        }
        return await handler(event, context);
    } catch (error) {
        console.error("Function error:", error.message, error.stack);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
};

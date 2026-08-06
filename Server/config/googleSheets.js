const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const ServiceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, ServiceAccountAuth);

let connected = false;

const ConnectGoogleSheets = async () => {
    if (connected) return doc;
    try {
        await doc.loadInfo();
        connected = true;
        console.log("✅ Connected to Google Sheet:", doc.title);
        return doc;
    } catch (error) {
        console.error("❌ Failed to connect to Google Sheets:", error);
        throw error;
    }
};

module.exports = ConnectGoogleSheets;

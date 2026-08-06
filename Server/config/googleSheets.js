const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const creds = require("../credentials.json");

const ServiceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, ServiceAccountAuth);
const ConnectGoogleSheets = async () => {
    try {
        await doc.loadInfo();
        console.log("✅ Connected to Google Sheet");
        console.log("Spreadsheet:", doc.title);
        return doc;
    } catch (error) {
        console.log(error);
    }
}

module.exports = ConnectGoogleSheets

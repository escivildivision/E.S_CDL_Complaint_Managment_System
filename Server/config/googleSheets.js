let doc = null;

const ConnectGoogleSheets = async () => {
    if (doc) return doc;

    // Use dynamic import() because google-spreadsheet v5 is ESM-only
    const { GoogleSpreadsheet } = await import("google-spreadsheet");
    const { JWT } = await import("google-auth-library");

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);

    try {
        await doc.loadInfo();
        console.log("✅ Connected to Google Sheet:", doc.title);
        return doc;
    } catch (error) {
        doc = null; // reset so next call retries
        console.error("❌ Failed to connect to Google Sheets:", error.message);
        throw error;
    }
};

module.exports = ConnectGoogleSheets;

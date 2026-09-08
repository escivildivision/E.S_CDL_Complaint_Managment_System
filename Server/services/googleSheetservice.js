const connectGoogleSheet = require("../config/googleSheets");

const isSpreadsheetErrorValue = (value) => {
    if (value === null || value === undefined) return true;
    const text = String(value).trim();
    return !text || /^#.*!$/.test(text);
};

const sanitizeComplaintNumber = (value, fallback = "") => {
    if (isSpreadsheetErrorValue(value)) {
        return fallback;
    }

    return String(value).trim();
};

const getNumericComplaintNumber = (value) => {
    const cleaned = sanitizeComplaintNumber(value);
    if (!cleaned) {
        return Number.NaN;
    }

    const parsed = Number.parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const safeLoadHeaderRow = async (sheet) => {
    try {
        await sheet.loadHeaderRow();
    } catch (err) {
        if (err.message && err.message.includes("Duplicate header detected")) {
            console.error(
                `\n❌ GOOGLE SHEET HEADER ERROR: ${err.message}\n` +
                `👉 FIX: Open your Google Sheet ("Complaints" tab) and check Row 1 (Header row).\n` +
                `   You currently have two columns named "Remarks".\n` +
                `   Please delete or rename the extra duplicate "Remarks" column in Row 1 so all header names are unique.\n`
            );
        }
        throw err;
    }
};

const getComplaintNumberHeader = (sheet) => {
    const header = sheet.headerValues.find((value) =>
        ["complaint no", "complaint number"].includes(
            value.toString().trim().toLowerCase().replace(/[^a-z0-9 ]/g, "")
        )
    );

    if (!header) {
        throw new Error(
            `Complaints sheet must contain a Complaint No header. Found: ${sheet.headerValues.join(", ")}`
        );
    }

    return header;
};

// Get Categories
const getCategories = async () => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Categories"];

    const rows = await sheet.getRows();

    return rows.map((row) => ({
        id: row.get("ID"),
        category: row.get("Category"),
    }));
};

// Get Priorities
const getPriorities = async () => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Priorities"];

    const rows = await sheet.getRows();

    return rows.map((row) => ({
        id: row.get("ID"),
        priority: row.get("Priority"),
    }));
};


const createComplaint = async (data) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    // Auto-generate complaint number (max existing number + 1), ignoring corrupted spreadsheet values such as #REF!
    const rows = await sheet.getRows();
    const existingNumbers = rows
        .map((row) => getNumericComplaintNumber(row.get(complaintNumberHeader)))
        .filter((n) => !Number.isNaN(n) && n < 10000);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const complaintNo = String(maxNumber + 1);
    console.log("Auto-generated Complaint No:", complaintNo);

    const newRow = await sheet.addRow({
        Date: data.date || "",
        Location: data.location || "",
        Category: data.category || "",
        "Complained Person": data.complainedPerson || "",
        "Complaint Details": data.complaintDetails || "",
        "Time Note": data.timeNote || "",
        "Time Done": data.timeDone || "",
        Supervisor: data.supervisor || "",
        Priority: data.priority || "",
        Status: data.status || data.remarks || "",
        Remarks: data.remarks || "",
        "Attended By": data.attendedBy || "",
        "Number of Workers": data.numberOfWorkers || "",
        "Completion Date": data.completionDate || "",
        "Material Consumed": data.materialConsumed || "",
    });

    newRow.set(complaintNumberHeader, complaintNo);
    await newRow.save();

    return { ...data, complaintNo };
};


const GetAllComplaint = async () => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    return rows
        .map((row) => {
            const complaintNoValue = sanitizeComplaintNumber(row.get(complaintNumberHeader), "");
            return {
                complaintNo: complaintNoValue,
                date: row.get("Date"),
                location: row.get("Location"),
                category: row.get("Category"),
                complainedPerson: row.get("Complained Person"),
                complaintDetails: row.get("Complaint Details"),
                timeNote: row.get("Time Note"),
                timeDone: row.get("Time Done"),
                attendedBy: row.get("Attended By"),
                numberOfWorkers: row.get("Number of Workers"),
                completionDate: row.get("Completion Date"),
                supervisor: row.get("Supervisor"),
                priority: row.get("Priority"),
                status: row.get("Status") || row.get("Remarks") || "",
                remarks: row.get("Remarks") || "",
                materialConsumed: row.get("Material Consumed"),
            };
        })
        .sort((a, b) => {
            const numA = getNumericComplaintNumber(a.complaintNo);
            const numB = getNumericComplaintNumber(b.complaintNo);
            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                return numB - numA;
            }
            return (b.complaintNo || "").localeCompare(a.complaintNo || "");
        });
};
const UpdateComplaint = async (complaintNo, data) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const targetComplaintNo = sanitizeComplaintNumber(complaintNo, "");
    const row = rows.find(
        (row) => sanitizeComplaintNumber(row.get(complaintNumberHeader), "") === targetComplaintNo
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    const fieldMap = {
        "Date": ["date", "Date"],
        "Location": ["location", "Location"],
        "Category": ["category", "Category"],
        "Complained Person": ["complainedPerson", "Complained Person"],
        "Complaint Details": ["complaintDetails", "Complaint Details"],
        "Time Note": ["timeNote", "Time Note"],
        "Time Done": ["timeDone", "Time Done"],
        "Attended By": ["attendedBy", "Attended By"],
        "Number of Workers": ["numberOfWorkers", "Number of Workers"],
        "Completion Date": ["completionDate", "Completion Date"],
        "Supervisor": ["supervisor", "Supervisor"],
        "Priority": ["priority", "Priority"],
        "Status": ["status", "Status"],
        "Remarks": ["remarks", "Remarks"],
        "Material Consumed": ["materialConsumed", "Material Consumed"],
    };

    for (const [sheetHeader, keys] of Object.entries(fieldMap)) {
        for (const key of keys) {
            if (data[key] !== undefined) {
                row.set(sheetHeader, data[key]);
                break;
            }
        }
    }

    const currentComplaintNo = sanitizeComplaintNumber(row.get(complaintNumberHeader), targetComplaintNo || "");
    row.set(complaintNumberHeader, currentComplaintNo || targetComplaintNo || "");

    await row.save();

    return row.toObject();
};

const GetSpecificComplaint = async (complaintNo) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const targetComplaintNo = sanitizeComplaintNumber(complaintNo, "");
    const row = rows.find(
        (row) => sanitizeComplaintNumber(row.get(complaintNumberHeader), "") === targetComplaintNo
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    const cleanedRow = row.toObject();
    const cleanComplaintNo = sanitizeComplaintNumber(cleanedRow[complaintNumberHeader], targetComplaintNo || "");
    if (cleanComplaintNo && cleanComplaintNo !== cleanedRow[complaintNumberHeader]) {
        row.set(complaintNumberHeader, cleanComplaintNo);
        await row.save();
    }

    return {
        ...cleanedRow,
        [complaintNumberHeader]: cleanComplaintNo,
        complaintNo: cleanComplaintNo,
    };
};

const DelComplaint = async (complaintNo) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const targetComplaintNo = sanitizeComplaintNumber(complaintNo, "");
    const row = rows.find(
        (row) => sanitizeComplaintNumber(row.get(complaintNumberHeader), "") === targetComplaintNo
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    const deletedData = row.toObject();
    await row.delete();

    const remainingRows = await sheet.getRows();
    for (let i = 0; i < remainingRows.length; i++) {
        const nextComplaintNumber = String(i + 1);
        const currentValue = sanitizeComplaintNumber(remainingRows[i].get(complaintNumberHeader), nextComplaintNumber);
        remainingRows[i].set(complaintNumberHeader, currentValue || nextComplaintNumber);
        await remainingRows[i].save();
    }

    return deletedData;
};

const getNextComplaintNo = async () => {
    const doc = await connectGoogleSheet();
    const sheet = doc.sheetsByTitle["Complaints"];
    await safeLoadHeaderRow(sheet);
    const complaintNumberHeader = getComplaintNumberHeader(sheet);
    const rows = await sheet.getRows();
    const existingNumbers = rows
        .map((row) => getNumericComplaintNumber(row.get(complaintNumberHeader)))
        .filter((n) => !Number.isNaN(n) && n < 10000);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return String(maxNumber + 1);
};

module.exports = {
    getCategories,
    getPriorities,
    createComplaint,
    GetAllComplaint,
    UpdateComplaint,
    GetSpecificComplaint,
    DelComplaint,
    getNextComplaintNo,
    sanitizeComplaintNumber,
    getNumericComplaintNumber,
};
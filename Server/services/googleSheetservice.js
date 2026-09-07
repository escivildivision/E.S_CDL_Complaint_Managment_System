const connectGoogleSheet = require("../config/googleSheets");

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
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    // Auto-generate complaint number (max existing number + 1)
    const rows = await sheet.getRows();
    const existingNumbers = rows
        .map((row) => parseInt(row.get(complaintNumberHeader), 10))
        .filter((n) => !isNaN(n) && n < 10000);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const complaintNo = String(maxNumber + 1);
    console.log("Auto-generated Complaint No:", complaintNo);

    const newRow = await sheet.addRow({
        Date: data.date,
        Location: data.location,
        Category: data.category,
        "Complained Person": data.complainedPerson,
        "Complaint Details": data.complaintDetails,
        "Time Note": data.timeNote,
        "Time Done": data.timeDone,
        Supervisor: data.supervisor,
        Priority: data.priority,
        Remarks: data.remarks,
        "Attended By": data.attendedBy,
        "Number of Workers": data.numberOfWorkers,
        "Completion Date": data.completionDate || "",
        "Material Consumed": data.materialConsumed,
    });

    newRow.set(complaintNumberHeader, complaintNo);
    await newRow.save();

    return { ...data, complaintNo };
};


const GetAllComplaint = async () => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    return rows
        .map((row) => ({
            complaintNo: row.get(complaintNumberHeader),
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
            remarks: row.get("Remarks"),
            materialConsumed: row.get("Material Consumed"),
        }))
        .sort((a, b) => {
            const numA = parseInt(a.complaintNo || "0", 10);
            const numB = parseInt(b.complaintNo || "0", 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA;
            }
            return (b.complaintNo || "").localeCompare(a.complaintNo || "");
        });
};
const UpdateComplaint = async (complaintNo, data) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get(complaintNumberHeader)?.toString().trim() === complaintNo?.toString().trim()
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

    await row.save();

    return row.toObject();
};

const GetSpecificComplaint = async (complaintNo) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get(complaintNumberHeader)?.toString().trim() === complaintNo?.toString().trim()
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    return row.toObject();
};

const DelComplaint = async (complaintNo) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get(complaintNumberHeader)?.toString().trim() === complaintNo?.toString().trim()
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    const deletedData = row.toObject();
    await row.delete();

    // Renumber remaining complaints to fill gaps
    const remainingRows = await sheet.getRows();
    for (let i = 0; i < remainingRows.length; i++) {
        remainingRows[i].set(complaintNumberHeader, i + 1);
        await remainingRows[i].save();
    }

    return deletedData;
};

const getNextComplaintNo = async () => {
    const doc = await connectGoogleSheet();
    const sheet = doc.sheetsByTitle["Complaints"];
    await sheet.loadHeaderRow();
    const complaintNumberHeader = getComplaintNumberHeader(sheet);
    const rows = await sheet.getRows();
    const existingNumbers = rows
        .map((row) => parseInt(row.get(complaintNumberHeader), 10))
        .filter((n) => !isNaN(n) && n < 10000);

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
};
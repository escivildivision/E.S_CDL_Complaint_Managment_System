const connectGoogleSheet = require("../config/googleSheets");

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

    await sheet.addRow({
        "Complaint No": data.complaintNo,
        Date: data.date,
        Location: data.location,
        Category: data.category,
        "Complained Person": data.complainedPerson,
        "Complaint Details": data.complaintDetails,
        "Time Note": data.timeNote,
        "Time Done": data.timeDone,
        "Attended By": data.attendedBy,
        "Number of Workers": data.numberOfWorkers,
        "Completion Date": data.completionDate || "",
        Supervisor: data.supervisor,
        Priority: data.priority,
        Remarks: data.remarks,
        "Material Consumed": data.materialConsumed,
    });

    return data;
};


const GetAllComplaint = async () => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];

    const rows = await sheet.getRows();

    return rows.map((row) => ({
        complaintNo: row.get("Complaint No"),
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
    }));
};
const UpdateComplaint = async (complaintNo, data) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get("Complaint No")?.toString().trim() === complaintNo?.toString().trim()
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

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get("Complaint No")?.toString().trim() === complaintNo?.toString().trim()
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    return row.toObject();
};

const DelComplaint = async (complaintNo) => {
    const doc = await connectGoogleSheet();

    const sheet = doc.sheetsByTitle["Complaints"];

    const rows = await sheet.getRows();

    const row = rows.find(
        (row) => row.get("Complaint No")?.toString().trim() === complaintNo?.toString().trim()
    );

    if (!row) {
        throw new Error("Complaint not found");
    }

    await row.delete();

    return row.toObject();
};


module.exports = {
    getCategories,
    getPriorities,
    createComplaint,
    GetAllComplaint,
    UpdateComplaint,
    GetSpecificComplaint,
    DelComplaint,
};
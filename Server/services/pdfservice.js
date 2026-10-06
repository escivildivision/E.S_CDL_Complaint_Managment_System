const fs = require("fs");
const path = require("path");
const PdfMake = require("pdfmake");
const vfsFonts = require("pdfmake/build/vfs_fonts");

const printer = new PdfMake({
    Roboto: {
        normal: Buffer.from(vfsFonts["Roboto-Regular.ttf"], "base64"),
        bold: Buffer.from(vfsFonts["Roboto-Medium.ttf"], "base64"),
        italics: Buffer.from(vfsFonts["Roboto-Italic.ttf"], "base64"),
        bolditalics: Buffer.from(vfsFonts["Roboto-MediumItalic.ttf"], "base64"),
    },
});

const getLogoBase64 = () => {
    // Check if logo exists using the correct casing
    const possiblePaths = [
        path.join(__dirname, "../assets/LogoPAA.png"),
        path.join(__dirname, "../../client/src/assets/LogoPAA.png"),
    ];

    for (const imgPath of possiblePaths) {
        if (fs.existsSync(imgPath)) {
            const ext = path.extname(imgPath).replace(".", "");
            return `data:image/${ext};base64,${fs.readFileSync(imgPath).toString("base64")}`;
        }
    }
    return null;
};

const generateComplaintPDF = (complaints) => {
    const logoData = getLogoBase64();

    // 1. SORT DATA IN ASCENDING ORDER BY COMPLAINT NO
    // We use parseInt to ensure it sorts numerically (e.g., 2 comes before 10)
    complaints.sort((a, b) => {
        return parseInt(a.complaintNo || 0) - parseInt(b.complaintNo || 0);
    });

    const tableBody = [
        [
            { text: "Complaint No", bold: true },
            { text: "Date", bold: true },
            { text: "Location", bold: true },
            { text: "Details", bold: true }, // Details header
            { text: "Category", bold: true },
            { text: "Priority", bold: true },
            { text: "Shift Incharge", bold: true },
            { text: "Status", bold: true },
        ],
    ];

    complaints.forEach((item) => {
        tableBody.push([
            item.complaintNo || "",
            item.date || "",
            item.location || "",
            item.complaintDetails || "", // Details data mapped here
            item.category || "",
            item.priority || "",
            item.supervisor || "",
            item.status || item.remarks || "",
        ]);
    });

    const content = [];

    // Add Logo if available
    if (logoData) {
        content.push({
            image: logoData,
            width: 70,
            alignment: "center",
            margin: [0, 0, 0, 10],
        });
    }

    content.push(
        {
            text: "Pakistan Airport Authority",
            style: "companyName",
        },
        {
            text: "Complaint Management Report",
            style: "title",
        },
        {
            text: "E.S Civil Division Land Side",
            style: "subtitle",
        },
        {
            text: `Generated On : ${new Date().toLocaleString()}`,
            fontSize: 8,
            color: "#666666",
            margin: [0, 0, 0, 10],
        },
        {
            table: {
                headerRows: 1,
                // 2. UPDATED WIDTHS: Now has exactly 8 items to match the 8 columns
                // Using '*' for Details so it takes up the remaining available space
                widths: [50, 50, 65, "*", 50, 40, 55, 45], 
                body: tableBody,
            },
            layout: {
                paddingLeft: function () { return 4; },
                paddingRight: function () { return 4; },
                paddingTop: function () { return 4; },
                paddingBottom: function () { return 4; },
            }
        },
        {
            text: `Total Complaints : ${complaints.length}`,
            bold: true,
            fontSize: 9,
            margin: [0, 10, 0, 0],
        }
    );

    const docDefinition = {
        defaultStyle: {
            font: "Roboto",
            fontSize: 8,
        },
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [25, 20, 25, 25],

        footer: function (currentPage, pageCount) {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: "center",
                margin: [0, 5],
                fontSize: 8,
            };
        },

        content: content,

        styles: {
            companyName: {
                fontSize: 16,
                bold: true,
                alignment: "center",
            },
            title: {
                fontSize: 12,
                bold: true,
                alignment: "center",
                margin: [0, 2, 0, 2],
            },
            subtitle: {
                fontSize: 10,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 8],
            },
        },
    };

    return printer.createPdfKitDocument(docDefinition);
};

module.exports = {
    generateComplaintPDF,
};
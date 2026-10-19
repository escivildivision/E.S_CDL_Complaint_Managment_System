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

    // 1. Sort ascending by complaint number
    complaints.sort((a, b) => {
        return parseInt(a.complaintNo || 0) - parseInt(b.complaintNo || 0);
    });

    // 2. Header Block
    const headerBlock = {
        table: {
            widths: [110, "*", 130],
            body: [
                [
                    logoData
                        ? { image: logoData, width: 65, alignment: "center", margin: [0, 4, 0, 4] }
                        : { text: "" },
                    {
                        stack: [
                            { text: "CIVIL AVIATION AUTHORITY", bold: true, fontSize: 12, decoration: "underline", alignment: "center" },
                            { text: "CUSTOMER COMPLAINT / FEEDBACK LOG/ DAILY DEPLOYMENT", bold: true, fontSize: 10, alignment: "center", margin: [0, 2, 0, 0] },
                        ],
                        alignment: "center",
                        margin: [0, 6, 0, 4],
                    },
                    {
                        text: "CAAF-041-MSXX-1.0",
                        bold: true,
                        fontSize: 9,
                        decoration: "underline",
                        alignment: "center",
                        margin: [0, 10, 0, 0],
                    },
                ],
                [
                    {},
                    {
                        text: "Directorate of Safety & Quality Management System (SQMS)",
                        bold: true,
                        fontSize: 8.5,
                        alignment: "center",
                        margin: [0, 2, 0, 2],
                    },
                    {},
                ],
                [
                    {
                        colSpan: 3,
                        text: [
                            { text: "Division / Directorate / Branch / Airport / Location / Section: ", bold: true },
                            { text: "E.S Civil Division Land Side" },
                        ],
                        fontSize: 8,
                        margin: [4, 3, 4, 3],
                    },
                    {},
                    {},
                ],
            ],
        },
        layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
        },
        margin: [0, 0, 0, -0.6],
    };

    // 3. Table Header (Exactly 9 columns)
    const tableBody = [
        [
            { text: "Complaint / Feedback", colSpan: 2, bold: true, alignment: "center" },
            {},
            { text: "Complaint / Feedback Provider", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Location", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Brief Text of Complaint", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Assigned Workers", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Category", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Priority", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Shift Incharge", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Complain Status", rowSpan: 2, bold: true, alignment: "center" },
            { text: "Remarks", rowSpan: 2, bold: true, alignment: "center" },
        ],
        [
            { text: "Ref. No.", bold: true, alignment: "center" },
            { text: "Date", bold: true, alignment: "center" },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
        ],
    ];

    // 4. Data Rows (Must have exactly 9 values)
    complaints.forEach((item) => {
        tableBody.push([
            item.complaintNo || "",                                             // 1. Complaint No
            item.date || "",                                                    // 2. Date
            item.complainedPerson || "",                                        // 3. Provider name
            item.location || "",                                                // 4. Location
            item.complaintDetails || "",                                        // 5. Details
            item.workerNames || "",                                             // 6. Assigned Workers
            item.category || "",                                                // 7. Category
            item.priority || "",                                                // 8. Priority
            item.supervisor || "",                                              // 9. Shift Incharge
            item.status || item.remarks || "",                                  // 10. Status / Resolved
            item.remarks || "",                                                 // 11. Remarks
        ]);
    });

    const content = [];

    // Push the header block first
    content.push(headerBlock);

    // Push the complaint table with 9 matching widths
    content.push({
        table: {
            headerRows: 2,
            widths: [40, 42, 65, 50, "*", 60, 38, 45, 55, 50, 50],
            body: tableBody,
        },
        layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            hLineColor: () => "#000000",
            vLineColor: () => "#000000",
            paddingLeft: () => 3,
            paddingRight: () => 3,
            paddingTop: () => 3,
            paddingBottom: () => 3,
        },
    });

    content.push({
        text: `Total Complaints : ${complaints.length}`,
        bold: true,
        fontSize: 8.5,
        margin: [0, 8, 0, 0],
    });

    const docDefinition = {
        defaultStyle: {
            font: "Roboto",
            fontSize: 7.5,
        },
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [20, 20, 20, 20],

        footer: function (currentPage, pageCount) {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: "center",
                margin: [0, 5],
                fontSize: 7.5,
            };
        },

        content: content,
    };

    return printer.createPdfKitDocument(docDefinition);
};

module.exports = {
    generateComplaintPDF,
};
const { GetAllComplaint } = require("../services/googleSheetservice");
const { generateComplaintPDF } = require("../services/pdfservice");

const downloadComplaintReport = async (req, res) => {
    try {
        const complaints = await GetAllComplaint();

        const { category, priority, dateFilter, startDate, endDate } = req.query;

        const filteredComplaints = complaints.filter((c) => {
            if (category && category !== "All Categories" && c.category !== category) return false;
            if (priority && priority !== "All Priorities" && c.priority?.toLowerCase() !== priority.toLowerCase()) return false;

            if (dateFilter && dateFilter !== "All" && c.date) {
                const itemDate = new Date(c.date);
                const today = new Date();

                if (dateFilter === "Daily") {
                    if (itemDate.toDateString() !== today.toDateString()) return false;
                } else if (dateFilter === "Monthly") {
                    if (itemDate.getMonth() !== today.getMonth() || itemDate.getFullYear() !== today.getFullYear()) return false;
                } else if (dateFilter === "Yearly") {
                    if (itemDate.getFullYear() !== today.getFullYear()) return false;
                }
            }

            if (startDate && c.date) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const itemDate = new Date(c.date);
                if (itemDate < start) return false;
            }

            if (endDate && c.date) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                const itemDate = new Date(c.date);
                if (itemDate > end) return false;
            }

            return true;
        });

        const pdfDoc = generateComplaintPDF(filteredComplaints);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="Complaint_Report.pdf"'
        );

        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to generate PDF"
        });
    }
};

module.exports = {
    downloadComplaintReport
};
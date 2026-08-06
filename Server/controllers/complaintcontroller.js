const {
    createComplaint,
    GetAllComplaint,
    UpdateComplaint,
    GetSpecificComplaint,
    DelComplaint,
} = require("../services/googleSheetservice");

const addComplaint = async (req, res) => {
    try {
        const complaint = await createComplaint(req.body);

        res.status(201).json({
            success: true,
            message: "Complaint Added Successfully",
            data: complaint,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to add complaint",
        });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await GetAllComplaint();

        res.status(200).json({
            success: true,
            message: "Complaints Fetched Successfully",
            data: complaints,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch complaints",
        });
    }
};


const updateComplaint = async (req, res) => {
    try {
        const complaint = await UpdateComplaint(req.params.complaintNo, req.body);

        res.status(200).json({
            success: true,
            message: "Complaint Updated Successfully",
            data: complaint,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to update complaint",
        });
    }
};


const getSpecificComplaint = async (req, res) => {
    try {
        const complaint = await GetSpecificComplaint(req.params.complaintNo);

        res.status(200).json({
            success: true,
            message: "Complaint Fetched Successfully",
            data: complaint,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch complaint",
        });
    }
};

const DeleteComplaint = async (req, res) => {
    try {
        const complaint = await DelComplaint(req.params.complaintNo);

        res.status(200).json({
            success: true,
            message: "Complaint Deleted Successfully",
            data: complaint,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete complaint",
        });
    }
};

module.exports = {
    addComplaint,
    getAllComplaints,
    updateComplaint,
    getSpecificComplaint,
    DeleteComplaint,
};
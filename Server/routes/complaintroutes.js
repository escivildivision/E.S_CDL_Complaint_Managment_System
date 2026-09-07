const express = require("express");
const {
    addComplaint,
    getAllComplaints,
    updateComplaint,
    getSpecificComplaint,
    DeleteComplaint,
    nextComplaintNo,
} = require("../controllers/complaintcontroller");

const router = express.Router();

router.get("/next-complaint-no", nextComplaintNo);
router.post("/add-complaint", addComplaint);
router.get("/get-all-complaints", getAllComplaints);
router.put("/update-complaint/:complaintNo", updateComplaint);
router.get("/get-specific-complaint/:complaintNo", getSpecificComplaint);
router.delete("/delete-complaint/:complaintNo", DeleteComplaint);

module.exports = router;
const express = require("express");

const {
    downloadComplaintReport,
} = require("../controllers/reportcontroller");

const router = express.Router();

router.get("/download-complaints", downloadComplaintReport);

module.exports = router;
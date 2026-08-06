const express = require("express");

const {
    getAllPriorities,
} = require("../controllers/prioritycontroller");

const router = express.Router();

router.get("/", getAllPriorities);

module.exports = router;
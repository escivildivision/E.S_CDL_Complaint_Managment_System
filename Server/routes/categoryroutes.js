const express = require("express");

const {
    getAllCategories,
} = require("../controllers/categorycontroller");

const router = express.Router();

router.get("/", getAllCategories);

module.exports = router;
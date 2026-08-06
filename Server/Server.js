require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const ConnectGoogleSheets = require("./config/googleSheets");

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

const categoryRoutes = require("./routes/categoryroutes");
const priorityRoutes = require("./routes/priorityroutes");
const complaintRoutes = require("./routes/complaintroutes");
const reportRoutes = require("./routes/reportroute");

app.use("/api/categories", categoryRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Complaint Management System API Running 🚀",
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});


const port = process.env.PORT || 5000;

if (require.main === module) {
    const StartServer = async () => {
        try {
            await ConnectGoogleSheets();
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        } catch (error) {
            console.log(error);
        }
    };
    StartServer();
}

module.exports = app;
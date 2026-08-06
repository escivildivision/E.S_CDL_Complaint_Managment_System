const { getPriorities } = require("../services/googleSheetservice");

const getAllPriorities = async (req, res) => {
    try {
        const priorities = await getPriorities();

        res.status(200).json({
            success: true,
            data: priorities,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch priorities",
        });
    }
};

module.exports = {
    getAllPriorities,
};
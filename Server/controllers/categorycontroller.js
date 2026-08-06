const { getCategories } = require("../services/googleSheetservice");

const getAllCategories = async (req, res) => {
    try {
        const categories = await getCategories();

        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
};

module.exports = {
    getAllCategories,
};
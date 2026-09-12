import { getCapacity } from "../services/capacity.services.js";

export const getCapacityController = async (req, res) => {
    try {
        const capacity = await getCapacity();

        return res.status(200).json({
            success: true,
            data: capacity
        });
    } catch (error) {
        console.error("Capacity Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
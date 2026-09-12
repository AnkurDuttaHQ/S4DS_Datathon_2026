import mongoose from "mongoose";

const capacitySchema = new mongoose.Schema(
    {
        totalSlots: {
            type: Number,
            required: true,
            default: 50,
            min: 0
        },

        usedSlots: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const Capacity = mongoose.model("Capacity", capacitySchema);

export default Capacity;
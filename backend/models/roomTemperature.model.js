const mongoose = require("mongoose");

const roomTemperatureSchema = mongoose.Schema(

    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device',
            required: [true, "Device ID is required"]
        },
        timestamp: {
            type: Date,
            required: [true, "Timestamp is required"]
        },
        value: {
            type: Number,
            required: [true, "Value is required"]
        }
    }

);

roomTemperatureSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const RoomTemperature = mongoose.model("RoomTemperature", roomTemperatureSchema);

module.exports = RoomTemperature;

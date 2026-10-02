const mongoose = require("mongoose");

const internalTemperatureSchema = mongoose.Schema(

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
        sensor: {
            type: String,
            required: [true, "Sensor is required"]
        },
        value: {
            type: Number,
            required: [true, "Value is required"]
        }
    }

);

internalTemperatureSchema.index(
    {
        deviceId: 1,
        sensor: 1,
        timestamp: -1
    }
);

const InternalTemperature = mongoose.model("InternalTemperature", internalTemperatureSchema);

module.exports = InternalTemperature;

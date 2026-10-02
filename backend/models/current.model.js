const mongoose = require("mongoose");

const currentSchema = mongoose.Schema(

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

currentSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const Current = mongoose.model("Current", currentSchema);

module.exports = Current;

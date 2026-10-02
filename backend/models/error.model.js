const mongoose = require("mongoose");

const errorSchema = mongoose.Schema(

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
        code: {
            type: String,
            required: [true, "Error code is required"]
        }
    }

);

errorSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const ErrorModel = mongoose.model("Error", errorSchema);

module.exports = ErrorModel;

const mongoose = require("mongoose");

const compressorFrequencySchema = mongoose.Schema(

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

compressorFrequencySchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const CompressorFrequency = mongoose.model("CompressorFrequency", compressorFrequencySchema);

module.exports = CompressorFrequency;

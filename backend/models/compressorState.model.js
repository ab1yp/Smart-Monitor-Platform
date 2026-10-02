const mongoose = require("mongoose");

const compressorStateSchema = mongoose.Schema(

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
            type: String,
            enum: ['ON', 'OFF'],
            required: [true, "Compressor state is required"]
        }
    }

);

compressorStateSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const CompressorState = mongoose.model("CompressorState", compressorStateSchema);

module.exports = CompressorState;

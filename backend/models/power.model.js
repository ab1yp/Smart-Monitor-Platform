const mongoose = require("mongoose");

const powerSchema = mongoose.Schema(

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

powerSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const Power = mongoose.model("Power", powerSchema);

module.exports = Power;

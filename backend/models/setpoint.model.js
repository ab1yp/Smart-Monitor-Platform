const mongoose = require("mongoose");

const setpointSchema = mongoose.Schema(

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

setpointSchema.index(
    {
        deviceId: 1,
        timestamp: -1
    }
);

const Setpoint = mongoose.model("Setpoint", setpointSchema);

module.exports = Setpoint;

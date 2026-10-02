const mongoose = require("mongoose");

const deviceMemberSchema = mongoose.Schema(

    {
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            required: [true, "Role is required"]
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User iD is required"]
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Created By iD is required"]
        },
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device',
            required: [true, "Device ID is required"]
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }

);

deviceMemberSchema.index(
    {
        deviceId: 1,
        userId: 1
    },
    {
        unique: true
    }
);

const DeviceMember = mongoose.model("DeviceMember", deviceMemberSchema);

module.exports = DeviceMember;

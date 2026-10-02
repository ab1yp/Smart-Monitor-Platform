const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(

    {
        name: {
            type: String,
            required: [true, "Name is required"]
        },
        description: {
            type: String,
            required: false
        },
        model: {
            type: String,
            required: false
        },
        serialNumber: {
            type: String,
            required: false,
            unique: true,
            sparse: true
        },
        location: {
            type: String,
            required: false
        },
        installationDate: {
            type: Date,
            required: false
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Owner ID is required"]
        },
    }, { timestamps: true }

);

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;

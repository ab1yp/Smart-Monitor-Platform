const mongoose = require("mongoose");

const temperatureSnapshotSchema = mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const errorSnapshotSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const statusSchema = mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: [true, "Device ID is required"],
      unique: true,
    },

    online: {
      type: Boolean,
      default: false,
    },

    compressor: {
      type: String,
      enum: ["ON", "OFF"],
      default: "OFF",
    },

    roomTemperature: {
      type: Number,
      default: null,
    },

    setpoint: {
      type: Number,
      default: null,
    },

    compressorFrequency: {
      type: Number,
      default: 0,
    },

    power: {
      type: Number,
      default: 0,
    },

    current: {
      type: Number,
      default: 0,
    },

    internalTemperature: {
      evaporator: {
        type: temperatureSnapshotSchema,
        default: null,
      },
      condenser: {
        type: temperatureSnapshotSchema,
        default: null,
      },
      discharge: {
        type: temperatureSnapshotSchema,
        default: null,
      },
    },

    lastError: {
      type: errorSnapshotSchema,
      default: null,
    },

    lastUpdated: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

statusSchema.index({ deviceId: 1 }, { unique: true });

const Status = mongoose.model("Status", statusSchema);

module.exports = Status;

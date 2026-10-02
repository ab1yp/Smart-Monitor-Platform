const Device = require("../models/device.model");
const DeviceMember = require("../models/deviceMember.model");
const Status = require("../models/status.model");
const CompressorFrequency = require("../models/compressorFrequency.model");
const CompressorState = require("../models/compressorState.model");
const Current = require("../models/current.model");
const AcError = require("../models/error.model");
const InternalTemperature = require("../models/internalTemperature.model");
const Power = require("../models/power.model");
const RoomTemperature = require("../models/roomTemperature.model");
const Setpoint = require("../models/setpoint.model");

const createDefaultStatus = (deviceId) => ({
  deviceId,
  online: false,
  compressor: "OFF",
  roomTemperature: null,
  setpoint: null,
  compressorFrequency: 0,
  power: 0,
  current: 0,
  internalTemperature: {
    evaporator: null,
    condenser: null,
    discharge: null,
  },
  lastError: null,
  lastUpdated: null,
});

const createDevice = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Device name is required",
      });
    }

    const device = await Device.create({
      name: name.trim(),
      description,
      ownerId: req.user.userId,
    });

    await Promise.all([
      DeviceMember.create({
        deviceId: device._id,
        userId: req.user.userId,
        createdById: req.user.userId,
        role: "owner",
      }),
      Status.create(createDefaultStatus(device._id)),
    ]);

    return res.status(201).json({
      success: true,
      message: "Device created successfully",
      responseData: {
        device,
      },
    });
  } catch (err) {
    console.error("Create device error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const getDevices = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const deviceIds = await DeviceMember.distinct("deviceId", { userId });

    if (!deviceIds.length) {
      return res.status(200).json({
        success: true,
        responseData: {
          devices: [],
        },
      });
    }

    const [devices, statuses] = await Promise.all([
      Device.find({ _id: { $in: deviceIds } })
        .populate("ownerId", "name email")
        .sort({ createdAt: -1 })
        .lean(),

      Status.find({ deviceId: { $in: deviceIds } }).lean(),
    ]);

    const statusMap = new Map(
      statuses.map((status) => [String(status.deviceId), status])
    );

    const devicesData = devices.map((device) => {
      const status =
        statusMap.get(String(device._id)) || createDefaultStatus(device._id);

      return {
        device,
        owner: device.ownerId
          ? {
            _id: device.ownerId._id,
            name: device.ownerId.name,
            email: device.ownerId.email,
          }
          : null,
        status,
      };
    });

    return res.status(200).json({
      success: true,
      responseData: {
        devices: devicesData,
      },
    });
  } catch (err) {
    console.error("Get devices error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const getDevice = async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const device = await Device.findById(deviceId)
      .populate("ownerId", "name email")
      .lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const currentUserMember = await DeviceMember.findOne({
      deviceId: device._id,
      userId,
    })
      .populate("userId", "name email")
      .populate("createdById", "name email")
      .lean();

    if (!currentUserMember) {
      return res.status(403).json({
        success: false,
        message: "User is not a member of this device",
      });
    }

    const [members, status] = await Promise.all([
      DeviceMember.find({ deviceId: device._id })
        .populate("userId", "name email")
        .populate("createdById", "name email")
        .sort({ joinedAt: 1 })
        .lean(),

      Status.findOne({ deviceId: device._id }).lean(),
    ]);

    const responseData = {
      device,
      owner: device.ownerId
        ? {
          _id: device.ownerId._id,
          name: device.ownerId.name,
          email: device.ownerId.email,
        }
        : null,
      currentUserMember,
      members,
      membersCount: members.length,
      status: status || createDefaultStatus(device._id),
    };

    return res.status(200).json({
      success: true,
      responseData,
    });
  } catch (err) {
    console.error("Get device error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const updateDevice = async (req, res) => {
  try {
    const { name, description, deviceId } = req.body;

    const deviceMember = await DeviceMember.findOne({
      userId: req.user.userId,
      deviceId,
    });

    if (!deviceMember) {
      return res.status(403).json({
        success: false,
        message: "User is not a member of this device",
      });
    }

    if (deviceMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the device owner can update the device",
      });
    }

    const updatedDevice = await Device.findByIdAndUpdate(
      deviceId,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device updated successfully",
      responseData: {
        device: updatedDevice,
      },
    });
  } catch (err) {
    console.error("Update device error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const deviceMember = await DeviceMember.findOne({
      userId: req.user.userId,
      deviceId,
    });

    if (!deviceMember) {
      return res.status(403).json({
        success: false,
        message: "User is not a member of this device",
      });
    }

    if (deviceMember.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the device owner can delete the device",
      });
    }

    const device = await Device.findById(deviceId).lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    await Promise.all([
      Status.deleteMany({ deviceId }),
      DeviceMember.deleteMany({ deviceId }),
      CompressorFrequency.deleteMany({ deviceId }),
      CompressorState.deleteMany({ deviceId }),
      Current.deleteMany({ deviceId }),
      AcError.deleteMany({ deviceId }),
      InternalTemperature.deleteMany({ deviceId }),
      Power.deleteMany({ deviceId }),
      RoomTemperature.deleteMany({ deviceId }),
      Setpoint.deleteMany({ deviceId }),
      Device.deleteOne({ _id: deviceId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Device and all associated data deleted successfully",
    });
  } catch (err) {
    console.error("Delete device error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

module.exports = {
  createDevice,
  getDevice,
  getDevices,
  updateDevice,
  deleteDevice,
};

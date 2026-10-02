const User = require("../models/user.model");
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

const getUser = async (req, res) => {
  try {
    const userData = await User.findById(req.user.userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      responseData: userData,
    });
  } catch (err) {
    console.error("Get user error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const searchValue = req.body?.searchValue?.trim() || "";

    if (!searchValue) {
      return res.status(200).json({
        success: true,
        responseData: [],
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
      ],
    }).select("name email createdAt");

    return res.status(200).json({
      success: true,
      responseData: users,
    });
  } catch (err) {
    console.error("Get users error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userData = await User.findById(req.params.userId).select(
      "name about email createdAt updatedAt"
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      responseData: userData,
    });
  } catch (err) {
    console.error("Get user by id error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, about, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, about, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("Update user error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const user = await User.findById(userId).select("_id").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ownedDevices = await Device.find({ ownerId: userId })
      .select("_id")
      .lean();

    const ownedDeviceIds = ownedDevices.map((device) => device._id);

    if (ownedDeviceIds.length) {
      await Promise.all([
        Status.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        DeviceMember.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        CompressorFrequency.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        CompressorState.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        Current.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        AcError.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        InternalTemperature.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        Power.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        RoomTemperature.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        Setpoint.deleteMany({ deviceId: { $in: ownedDeviceIds } }),
        Device.deleteMany({ _id: { $in: ownedDeviceIds }, ownerId: userId }),
      ]);
    }

    await DeviceMember.deleteMany({ userId });

    await User.deleteOne({ _id: userId });

    return res.status(200).json({
      success: true,
      message: "User and owned devices deleted successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

module.exports = {
  getUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

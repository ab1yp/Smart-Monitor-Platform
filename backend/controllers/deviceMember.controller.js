const DeviceMember = require("../models/deviceMember.model");
const User = require("../models/user.model");

const rolesWeight = {
  member: 1,
  admin: 2,
  owner: 3,
};

const validRoles = Object.keys(rolesWeight);

/**
 * Get the requester membership for a specific device
 */
const getMembership = async (userId, deviceId) => {
  return DeviceMember.findOne({
    userId,
    deviceId,
  });
};

/**
 * Create Device Member
 */
const createDeviceMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { role, memberId, deviceId } = req.body;

    if (!role || !memberId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Role, member ID and device ID are required",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check requester membership on this device
    const requester = await getMembership(userId, deviceId);

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    if (!["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add members",
      });
    }

    // Admin cannot create owner
    if (role === "owner" && requester.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the owner can assign the owner role",
      });
    }

    // Check target user exists
    const memberUser = await User.findById(memberId);

    if (!memberUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already a member
    const existingMember = await DeviceMember.findOne({
      userId: memberId,
      deviceId,
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a member of this device",
      });
    }

    const createdMember = await DeviceMember.create({
      userId: memberId,
      deviceId,
      role,
      createdById: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: createdMember,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Get all device members
 */
const getDeviceMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId } = req.params;

    const requester = await getMembership(userId, deviceId);

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    const deviceMembers = await DeviceMember.find({
      deviceId,
    }).populate("userId", "name email");

    return res.status(200).json({
      success: true,
      members: deviceMembers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Search device members
 */
const getSearchedDeviceMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId, searchValue } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const requester = await getMembership(userId, deviceId);

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    const search = searchValue?.trim().toLowerCase();

    if (!search) {
      return res.status(200).json({
        success: true,
        members: [],
      });
    }

    const memberIds = await DeviceMember.distinct("userId", {
      deviceId,
    });

    const users = await User.find({
      _id: { $in: memberIds },
    }).select("name email");

    const filteredUsers = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
    );

    return res.status(200).json({
      success: true,
      members: filteredUsers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Get current user's membership on a device
 */
const getDeviceMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId } = req.params;

    const memberData = await DeviceMember.findOne({
      deviceId,
      userId,
    }).populate("userId", "name email");

    if (!memberData) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    return res.status(200).json({
      success: true,
      member: memberData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Update member role
 */
const updateDeviceMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { role, memberId, deviceId } = req.body;

    if (!role || !memberId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Role, member ID and device ID are required",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Who is making the request?
    const requester = await getMembership(userId, deviceId);

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    if (!["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update members",
      });
    }

    // Member being updated
    const target = await DeviceMember.findOne({
      userId: memberId,
      deviceId,
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Target member not found",
      });
    }

    // Do not allow updating yourself through this endpoint
    if (target.userId.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Nobody can modify the owner through this endpoint
    if (target.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "The owner role cannot be modified",
      });
    }

    // Requester must have a higher role
    if (rolesWeight[requester.role] <= rolesWeight[target.role]) {
      return res.status(403).json({
        success: false,
        message: "You cannot update a member with the same or higher role",
      });
    }

    // Only owner can assign owner
    if (role === "owner" && requester.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the owner can assign the owner role",
      });
    }

    const updatedMember = await DeviceMember.findByIdAndUpdate(
      target._id,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: "Failed to update member",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Delete device member
 */
const deleteDeviceMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { memberId, deviceId } = req.body;

    if (!memberId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Member ID and device ID are required",
      });
    }

    // Who is making the request?
    const requester = await getMembership(userId, deviceId);

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this device",
      });
    }

    if (!["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete members",
      });
    }

    const target = await DeviceMember.findOne({
      userId: memberId,
      deviceId,
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Target member not found",
      });
    }

    // Owner cannot be deleted
    if (target.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "The owner cannot be deleted",
      });
    }

    // User cannot delete someone with same/higher role
    if (rolesWeight[requester.role] <= rolesWeight[target.role]) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete a member with the same or higher role",
      });
    }

    const deletedMember = await DeviceMember.findByIdAndDelete(target._id);

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Failed to delete member",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
      error: err.message,
    });
  }
};

module.exports = {
  createDeviceMember,
  getDeviceMembers,
  getDeviceMember,
  getSearchedDeviceMembers,
  updateDeviceMember,
  deleteDeviceMember,
};
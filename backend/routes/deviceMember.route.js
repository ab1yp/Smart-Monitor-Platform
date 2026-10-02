const express = require("express");
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware.js')
const {

    createDeviceMember,
    getDeviceMembers,
    getDeviceMember,
    getSearchedDeviceMembers,
    updateDeviceMember,
    deleteDeviceMember,
    
} = require("../controllers/deviceMember.controller.js")

router.post("/createDeviceMember", authMiddleware, createDeviceMember);
router.get("/getDeviceMembers/:deviceId", authMiddleware, getDeviceMembers);
router.get("/getDeviceMember/:deviceId", authMiddleware, getDeviceMember);
router.post("/getSearchedDeviceMembers", authMiddleware, getSearchedDeviceMembers);
router.put("/updateDeviceMember", authMiddleware, updateDeviceMember);
router.delete("/deleteDeviceMember", authMiddleware, deleteDeviceMember);


module.exports = router;

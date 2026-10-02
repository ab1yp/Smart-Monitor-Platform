const express = require("express");
const authMiddleware = require('../middleware/auth.middleware.js')
const {

    createDevice,
    getDevice,
    getDevices,
    updateDevice,
    deleteDevice,

} = require("../controllers/device.controller.js")
const router = express.Router()

router.post("/createDevice", authMiddleware, createDevice);
router.get("/getDevice/:deviceId", authMiddleware, getDevice);
router.get("/getDevices", authMiddleware, getDevices);
router.post("/updateDevice", authMiddleware, updateDevice);
router.delete("/deleteDevice/:deviceId", authMiddleware, deleteDevice);

module.exports = router;

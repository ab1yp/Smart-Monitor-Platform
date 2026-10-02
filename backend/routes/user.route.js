const express = require("express");
const {

    getUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,

} = require("../controllers/user.controller.js")
const authMiddleware = require('../middleware/auth.middleware.js')
const router = express.Router()

router.get("/getUser", authMiddleware, getUser);
router.post("/getUsers", authMiddleware, getUsers);
router.get("/getUserById/:userId", authMiddleware, getUserById);
router.put("/updateUser", authMiddleware, updateUser)
router.delete("/deleteUser", authMiddleware, deleteUser)

module.exports = router;

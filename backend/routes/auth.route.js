const express = require("express");
const {
    signIn,
    signUp,
    logout,
    forgotPass,
    updatePass
} = require("../controllers/auth.controller");
const router = express.Router();
const { refresh } = require("../controllers/refresh.controller");

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/refresh", refresh);
router.get("/logout", logout);
router.post("/forgot_password", forgotPass);
router.put("/update_password", updatePass);

module.exports = router;
const express = require('express');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const nodemailer = require('nodemailer')
const crypto = require('crypto')


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" })
        if (!(password.length >= 8)) return res.status(400).json({ message: "Password must be at least 8 characters" })
        const user = await User.findOne({email})
        if (user) return res.status(400).json({ message: "User already exists" })
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPass, createdAt: Date.now(), updatedAt: Date.now() });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            token: accessToken
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        path: "/api/auth/refresh"
    });
    res.sendStatus(204);
};

const forgotPass = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.FRONT_URL}/al/updatepassword?token=${resetToken}`;

        res.status(200).json({
            message: "Reset email request accepted."
        });

        transporter.sendMail({
            from: "khnfsmain@gmail.com",
            to: user.email,
            subject: "Reset your password",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                    <h2>Reset your password</h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your password.
                    </p>

                    <p>
                        Click the button below to create a new password.
                    </p>

                    <a
                        href="${resetLink}"
                        style="
                            display:inline-block;
                            background:#111827;
                            color:white;
                            text-decoration:none;
                            padding:12px 24px;
                            border-radius:8px;
                            margin:20px 0;
                        "
                    >
                        Reset Password
                    </a>

                    <p>
                        This link expires in 15 minutes and can only be used once.
                    </p>

                    <p>
                        If you didn't request this, you can safely ignore this email.
                    </p>

                    <hr>

                    <small>© WAMDA</small>
                </div>
            `
        }).catch(err => {
            console.error("Email send failed:", err);
        });

    } catch (err) {
        console.error(err);

        if (!res.headersSent) {
            res.status(500).json({
                message: "Internal server error."
            });
        }
    }
};

const updatePass = async (req, res) => {
    try {

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required."
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid reset token.: "
            });
        }

        if (user.resetPasswordExpires < Date.now()) {

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            return res.status(400).json({
                message: "Reset token has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};



module.exports = {
    signIn,
    signUp,
    updatePass,
    forgotPass,
    logout
};
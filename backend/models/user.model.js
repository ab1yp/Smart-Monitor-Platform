const mongoose = require("mongoose");

const userSchema = mongoose.Schema(

    {
        name: {
            type: String,
            required: [true, 'Name is requierd'],
        },
        about: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: [true, 'Email is requierd'],
            unique: true,
            validate: {
                validator: (value) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
                message: 'Please enter a valid email address'
            }
        },
        password: {
            type: String,
            required: [true, 'Password is requierd'],
            select: false,
        },
        resetPasswordToken: {
            type: String,
            required: false,
            select: false
        },
        resetPasswordExpires: {
            type: Date,
            required: false,
            select: false
        }

    }, { timestamps: true }

);

const User = mongoose.model("User", userSchema);

module.exports = User;
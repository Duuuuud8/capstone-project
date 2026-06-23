const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [
            /^\S+@\S+\.\S+$/,
            "Please enter a valid email address."
        ]
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

module.exports = mongoose.model("User", userSchema);
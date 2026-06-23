// Logic for handling incoming requests and returning responses to the client
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const registerUser = async (req, res) => {
    try{
        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({
                error: "Valid username, email, and password are required."
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if(existingUser) {
            return res.status(400).json({
                error: "username/email already exitsts"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
       
        res.status(201).json({
            message: "User registered successfully",
            token
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const loginUser = async (req, res, next) => {
    try{
        const { login, password } = req.body;

        if(!login || !password) {
            return res.status(400).json({
                error: "Login and Password are required for access."
            });
        }

        const user = await User.findOne({
            $or: [
                { username: login },
                { email: login.toLowerCase() }
            ]
        });

        if(!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        
        if(!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        res.json({
            message: "Login successful",
            token
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};
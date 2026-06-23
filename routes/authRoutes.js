const express = require("express");
const router = express.Router();
    // creates mini router
const {
    registerUser,
    loginUser
} = require("../controllers/authController");


router.post("/register", registerUser);
    // "Inside this router, make a POST route for /register"
router.post("/login", loginUser);



module.exports = router;
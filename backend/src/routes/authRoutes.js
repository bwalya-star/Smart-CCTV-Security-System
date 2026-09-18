const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/authController");

const {
    authenticateToken
} =
    require("../middleware/authMiddleware");

const router = express.Router();


// Register
router.post(
    "/register",
    register
);


// Login
router.post(
    "/login",
    login
);


// Current logged-in user
router.get(
    "/me",
    authenticateToken,
    getMe
);


module.exports = router;
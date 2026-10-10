const express = require("express");

const {
    register,
    login,
    getMe,
    requestPasswordReset,
    validatePasswordReset,
    resetPassword
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

router.post(
    "/forgot-password",
    requestPasswordReset
);

router.get(
    "/reset-password/:token",
    validatePasswordReset
);

router.post(
    "/reset-password/:token",
    resetPassword
);


// Current logged-in user
router.get(
    "/me",
    authenticateToken,
    getMe
);


module.exports = router;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail,
    getUserById
} = require("../services/databaseService");


// ==========================================
// REGISTER
// ==========================================

async function register(req, res) {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate input
        if (!name || !email || !password) {

            return res.status(400).json({
                error: "Name, email and password are required."
            });

        }


        // Check whether user already exists
        const existingUser =
            await findUserByEmail(email);

        if (existingUser) {

            return res.status(409).json({
                error: "An account with this email already exists."
            });

        }


        // Hash password
        const passwordHash =
            await bcrypt.hash(password, 10);


        // Save user
        const result =
            await createUser(
                name,
                email,
                passwordHash
            );


        res.status(201).json({

            message: "Account created successfully.",

            user: {
                id: result.insertId,
                name,
                email,
                role: "user"
            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
}


// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate input
        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required."
            });

        }


        // Find user
        const user =
            await findUserByEmail(email);


        if (!user) {

            return res.status(401).json({
                error: "Invalid email or password."
            });

        }


        // Compare password
        const passwordValid =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordValid) {

            return res.status(401).json({
                error: "Invalid email or password."
            });

        }


        // Create JWT
        const token =
            jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "24h"
                }

            );


        res.json({

            message: "Login successful.",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getMe(req, res) {

    try {

        const user =
            await getUserById(
                req.user.id
            );


        if (!user) {

            return res.status(404).json({
                error: "User not found."
            });

        }


        res.json({
            user
        });

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
}


module.exports = {
    register,
    login,
    getMe
};
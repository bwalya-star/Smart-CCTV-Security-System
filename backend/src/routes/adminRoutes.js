const express = require("express");
const {
    decideRequest,
    deleteUser,
    editUser,
    createUser,
    listRequests,
    listUsers
} = require("../controllers/adminController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(authenticateToken, requireAdmin);
router.get("/account-requests", listRequests);
router.patch("/account-requests/:id/:decision", decideRequest);
router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", editUser);
router.delete("/users/:id", deleteUser);

module.exports = router;

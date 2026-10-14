const express = require("express");
const multer = require("multer");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
    enrollPerson,
    listEnrolledPeople,
    maxImageBytes
} = require("../controllers/peopleController");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 10,
        fileSize: maxImageBytes
    },
    fileFilter: (req, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            callback(new Error("Images must be JPEG, PNG, or WebP files."));
            return;
        }
        callback(null, true);
    }
});

const router = express.Router();

router.get("/", authenticateToken, listEnrolledPeople);
router.post("/", authenticateToken, (req, res, next) => {
    upload.array("images", 10)(req, res, error => {
        if (!error) {
            next();
            return;
        }

        const isUploadLimit = error instanceof multer.MulterError;
        res.status(isUploadLimit ? 400 : 415).json({
            error: error.message || "Unable to process uploaded images."
        });
    });
}, enrollPerson);

module.exports = router;

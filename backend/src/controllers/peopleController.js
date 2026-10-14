const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const db = require("../config/db");

const projectRoot = path.join(__dirname, "../../../");
const peopleDirectory = path.join(projectRoot, "ai", "Service", "face_data", "enrolled_people");
const legacyPeopleDirectory = path.join(projectRoot, "ai", "Service", "face_data", "known_faces");
const aiDetectionUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001/api/detect";
const aiValidationUrl = process.env.AI_ENROLLMENT_VALIDATION_URL ||
    aiDetectionUrl.replace(/\/detect\/?$/, "/validate-enrollment");
const maxImageBytes = 4 * 1024 * 1024;
const maxTotalImageBytes = 20 * 1024 * 1024;
const legacyImportJobs = new Map();
const imageExtensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};
const supportedImageExtensions = new Set(Object.values(imageExtensions));

function getPersonDirectory(userId, personId) {
    return path.join(peopleDirectory, `user_${userId}_person_${personId}`);
}

function displayNameFromLegacyFolder(folderName) {
    return folderName.replace(/(^|[\s_-])\p{L}/gu, match => match.toLocaleUpperCase());
}

async function importLegacyPeopleForUser(userId) {
    const [identityRows] = await db.query(
        `SELECT LOWER(TRIM(identity_name)) AS identity_key,
                MIN(TRIM(identity_name)) AS identity_name,
                COUNT(DISTINCT user_id) AS owner_count,
                MAX(user_id = ?) AS is_current_user
         FROM alerts
         WHERE identity_name IS NOT NULL AND TRIM(identity_name) <> ''
         GROUP BY LOWER(TRIM(identity_name))`,
        [userId]
    );
    const ownedIdentityNames = new Map(
        identityRows
            .filter(row => Number(row.owner_count) === 1 && Number(row.is_current_user) === 1)
            .map(row => [row.identity_key, row.identity_name])
    );
    if (ownedIdentityNames.size === 0) {
        return;
    }

    const [existingRows] = await db.query(
        "SELECT LOWER(name) AS identity_key FROM enrolled_people WHERE user_id = ?",
        [userId]
    );
    const existingNames = new Set(existingRows.map(row => row.identity_key));
    let legacyFolders;
    try {
        legacyFolders = await fs.promises.readdir(legacyPeopleDirectory, { withFileTypes: true });
    } catch (error) {
        if (error.code === "ENOENT") {
            return;
        }
        throw error;
    }

    for (const folder of legacyFolders) {
        const identityKey = folder.name.trim().toLocaleLowerCase();
        if (!folder.isDirectory() || !ownedIdentityNames.has(identityKey) || existingNames.has(identityKey)) {
            continue;
        }

        const sourceDirectory = path.join(legacyPeopleDirectory, folder.name);
        const entries = await fs.promises.readdir(sourceDirectory, { withFileTypes: true });
        const imageEntries = entries.filter(entry =>
            entry.isFile() && supportedImageExtensions.has(path.extname(entry.name).toLocaleLowerCase())
        );
        if (imageEntries.length < 5 || imageEntries.length > 10) {
            console.warn(`Skipping legacy identity "${folder.name}": expected 5–10 supported images, found ${imageEntries.length}.`);
            continue;
        }

        const images = await Promise.all(imageEntries.map(async entry => {
            const imagePath = path.join(sourceDirectory, entry.name);
            const buffer = await fs.promises.readFile(imagePath);
            return {
                extension: path.extname(entry.name).toLocaleLowerCase(),
                buffer,
                hash: crypto.createHash("sha256").update(buffer).digest("hex")
            };
        }));
        const totalBytes = images.reduce((total, image) => total + image.buffer.length, 0);
        if (totalBytes > maxTotalImageBytes ||
            new Set(images.map(image => image.hash)).size !== images.length) {
            console.warn(`Skipping legacy identity "${folder.name}": total image size or distinct-image requirements are not met.`);
            continue;
        }

        const name = displayNameFromLegacyFolder(ownedIdentityNames.get(identityKey) || folder.name);
        const [result] = await db.query(
            `INSERT INTO enrolled_people (user_id, name, relationship, notes, photo_count)
             VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                name,
                "Legacy enrollment",
                "Imported from this account's existing face-recognition dataset.",
                images.length
            ]
        );
        const personDirectory = getPersonDirectory(userId, result.insertId);
        const stagingDirectory = path.join(peopleDirectory, `.pending_user_${userId}_person_${result.insertId}`);

        try {
            await fs.promises.mkdir(peopleDirectory, { recursive: true });
            await fs.promises.mkdir(stagingDirectory);
            await fs.promises.writeFile(
                path.join(stagingDirectory, "person.json"),
                JSON.stringify({ id: result.insertId, user_id: userId, name, legacy_source: folder.name })
            );
            await Promise.all(images.map((image, index) =>
                fs.promises.writeFile(
                    path.join(stagingDirectory, `image_${String(index + 1).padStart(2, "0")}${image.extension}`),
                    image.buffer,
                    { flag: "wx" }
                )
            ));
            await fs.promises.rename(stagingDirectory, personDirectory);
            existingNames.add(identityKey);
        } catch (error) {
            await fs.promises.rm(stagingDirectory, { recursive: true, force: true }).catch(cleanupError => {
                console.error("Unable to clean up incomplete legacy face import:", cleanupError);
            });
            await fs.promises.rm(personDirectory, { recursive: true, force: true }).catch(cleanupError => {
                console.error("Unable to clean up incomplete legacy face import:", cleanupError);
            });
            await db.query(
                "DELETE FROM enrolled_people WHERE id = ? AND user_id = ?",
                [result.insertId, userId]
            ).catch(cleanupError => {
                console.error("Unable to remove incomplete legacy enrollment record:", cleanupError);
            });
            throw error;
        }
    }
}

function ensureLegacyPeopleImported(userId) {
    if (!legacyImportJobs.has(userId)) {
        const importJob = importLegacyPeopleForUser(userId)
            .finally(() => legacyImportJobs.delete(userId));
        legacyImportJobs.set(userId, importJob);
    }
    return legacyImportJobs.get(userId);
}

async function validateImages(images) {
    const totalBytes = images.reduce((total, image) => total + image.size, 0);
    if (images.length < 5 || images.length > 10) {
        return { error: "Upload between 5 and 10 face images." };
    }
    if (images.some(image => image.size > maxImageBytes) || totalBytes > maxTotalImageBytes) {
        return { error: "Each image must be 4 MB or smaller, and all images together must be 20 MB or smaller." };
    }

    const hashes = images.map(image => image.buffer.toString("base64"));
    if (new Set(hashes).size !== hashes.length) {
        return { error: "Each image must be different; duplicate images were found." };
    }

    try {
        const response = await axios.post(aiValidationUrl, {
            images: hashes
        }, {
            timeout: 60000,
            maxBodyLength: maxTotalImageBytes * 2,
            maxContentLength: maxTotalImageBytes * 2
        });

        if (!response.data.valid) {
            return {
                error: response.data.error || "Every image must contain one clear, distinct face.",
                status: 400
            };
        }
        return { valid: true };
    } catch (error) {
        console.error("Enrollment image validation failed:", error.message);
        return {
            error: "Could not validate images with the face-recognition service. Check that the AI service is running and try again.",
            status: 503
        };
    }
}

async function listEnrolledPeople(req, res) {
    try {
        await ensureLegacyPeopleImported(req.user.id);
        const [rows] = await db.query(
            `SELECT id, name, relationship, notes, photo_count, created_at, updated_at
             FROM enrolled_people
             WHERE user_id = ?
             ORDER BY name ASC`,
            [req.user.id]
        );
        res.json({ people: rows });
    } catch (error) {
        console.error("Unable to load enrolled people:", error);
        if (error.code === "ER_NO_SUCH_TABLE") {
            return res.status(503).json({
                error: "Registered identities are unavailable until the database migrations are applied."
            });
        }
        res.status(500).json({ error: "Unable to load enrolled people." });
    }
}

async function enrollPerson(req, res) {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const relationship = typeof req.body?.relationship === "string"
        ? req.body.relationship.trim()
        : "";
    const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";

    if (name.length < 2 || name.length > 100 ||
        relationship.length < 2 || relationship.length > 60 ||
        notes.length > 1000) {
        return res.status(400).json({
            error: "Provide a name (2–100 characters), relationship (2–60 characters), and notes no longer than 1000 characters."
        });
    }

    const images = req.files || [];
    const validation = await validateImages(images);
    if (!validation.valid) {
        return res.status(validation.status || 400).json({ error: validation.error });
    }

    let personId;
    let personDirectory;
    let stagingDirectory;
    let personRowCreated = false;

    try {
        const [result] = await db.query(
            `INSERT INTO enrolled_people (user_id, name, relationship, notes, photo_count)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, name, relationship, notes || null, images.length]
        );
        personId = result.insertId;
        personRowCreated = true;
        personDirectory = getPersonDirectory(req.user.id, personId);
        stagingDirectory = path.join(peopleDirectory, `.pending_user_${req.user.id}_person_${personId}`);

        await fs.promises.mkdir(stagingDirectory, { recursive: true });
        await fs.promises.writeFile(
            path.join(stagingDirectory, "person.json"),
            JSON.stringify({ id: personId, user_id: req.user.id, name })
        );

        await Promise.all(images.map((image, index) => {
            const extension = imageExtensions[image.mimetype];
            return fs.promises.writeFile(
                path.join(stagingDirectory, `image_${String(index + 1).padStart(2, "0")}${extension}`),
                image.buffer,
                { flag: "wx" }
            );
        }));

        await fs.promises.mkdir(peopleDirectory, { recursive: true });
        await fs.promises.rename(stagingDirectory, personDirectory);

        res.status(201).json({
            person: {
                id: personId,
                name,
                relationship,
                notes: notes || null,
                photo_count: images.length
            }
        });
    } catch (error) {
        if (stagingDirectory) {
            await fs.promises.rm(stagingDirectory, { recursive: true, force: true }).catch(cleanupError => {
                console.error("Unable to clean up incomplete face enrollment:", cleanupError);
            });
        }
        if (personDirectory && await fs.promises.stat(personDirectory).then(() => true, () => false)) {
            await fs.promises.rm(personDirectory, { recursive: true, force: true }).catch(cleanupError => {
                console.error("Unable to clean up incomplete face enrollment:", cleanupError);
            });
        }
        if (personRowCreated) {
            await db.query(
                "DELETE FROM enrolled_people WHERE id = ? AND user_id = ?",
                [personId, req.user.id]
            ).catch(cleanupError => {
                console.error("Unable to remove incomplete face enrollment record:", cleanupError);
            });
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "A person with this name is already enrolled in your profile." });
        }

        console.error("Unable to enroll person:", error);
        res.status(500).json({ error: "Unable to save this person. Please try again." });
    }
}

async function unenrollPerson(req, res) {
    const personId = Number(req.params.id);
    if (!Number.isSafeInteger(personId) || personId < 1) {
        return res.status(400).json({ error: "Invalid enrolled person ID." });
    }

    try {
        const [rows] = await db.query(
            "SELECT id, name, relationship, notes FROM enrolled_people WHERE id = ? AND user_id = ? LIMIT 1",
            [personId, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Enrolled person not found." });
        }

        let legacySourceDirectory;
        const person = rows[0];
        const isLegacyImport = person.relationship === "Legacy enrollment" &&
            person.notes === "Imported from this account's existing face-recognition dataset.";
        if (isLegacyImport) {
            const [owners] = await db.query(
                `SELECT COUNT(DISTINCT user_id) AS owner_count,
                        MAX(user_id = ?) AS is_current_user
                 FROM alerts
                 WHERE LOWER(TRIM(identity_name)) = LOWER(TRIM(?))`,
                [req.user.id, person.name]
            );
            if (Number(owners[0].owner_count) === 1 && Number(owners[0].is_current_user) === 1) {
                let legacyFolders;
                try {
                    legacyFolders = await fs.promises.readdir(legacyPeopleDirectory, { withFileTypes: true });
                } catch (error) {
                    if (error.code !== "ENOENT") {
                        throw error;
                    }
                    legacyFolders = [];
                }
                const legacyFolder = legacyFolders.find(folder =>
                    folder.isDirectory() &&
                    folder.name.trim().toLocaleLowerCase() === person.name.trim().toLocaleLowerCase()
                );
                if (legacyFolder) {
                    legacySourceDirectory = path.join(legacyPeopleDirectory, legacyFolder.name);
                }
            }
        }

        const personDirectory = getPersonDirectory(req.user.id, personId);
        const quarantineDirectory = path.join(peopleDirectory, `.removing_user_${req.user.id}_person_${personId}`);
        const legacyQuarantineDirectory = path.join(
            peopleDirectory,
            `.removing_legacy_user_${req.user.id}_person_${personId}`
        );
        let quarantined = false;
        let legacyQuarantined = false;

        try {
            await fs.promises.rename(personDirectory, quarantineDirectory);
            quarantined = true;
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }

        try {
            if (legacySourceDirectory) {
                await fs.promises.rename(legacySourceDirectory, legacyQuarantineDirectory);
                legacyQuarantined = true;
            }
            await db.query(
                "DELETE FROM enrolled_people WHERE id = ? AND user_id = ?",
                [personId, req.user.id]
            );
        } catch (error) {
            if (legacyQuarantined) {
                await fs.promises.rename(legacyQuarantineDirectory, legacySourceDirectory).catch(restoreError => {
                    console.error("Unable to restore legacy face images after failed unenroll:", restoreError);
                });
            }
            if (quarantined) {
                await fs.promises.rename(quarantineDirectory, personDirectory).catch(restoreError => {
                    console.error("Unable to restore face enrollment after failed unenroll:", restoreError);
                });
            }
            throw error;
        }

        if (quarantined) {
            await fs.promises.rm(quarantineDirectory, { recursive: true, force: true });
        }
        if (legacyQuarantined) {
            await fs.promises.rm(legacyQuarantineDirectory, { recursive: true, force: true });
        }

        res.json({ deleted: true, id: personId });
    } catch (error) {
        console.error("Unable to unenroll person:", error);
        res.status(500).json({ error: "Unable to remove this person." });
    }
}

module.exports = {
    listEnrolledPeople,
    enrollPerson,
    unenrollPerson,
    imageExtensions,
    maxImageBytes
};

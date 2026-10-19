const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { getScheduleWindow } = require("../services/recordingScheduleService");
const {
    getMotionDetectionSettings,
    saveMotionDetectionSettings
} = require("../services/motionDetectionService");

let recording = false;
let recordingSource = null;
let cameraProcess = null;
let stopTimeout = null;
let stopping = false;
let startedScheduleWindow = null;
let activeRecordingFilename = null;

const projectRoot = path.join(__dirname, "../../../");
const stopFile = path.join(projectRoot, "hardware", "camera", "STOP_RECORDING");

function startCameraRecording(source) {
    if (recording || cameraProcess || stopping) {
        return false;
    }

    const pythonPath = path.join(projectRoot, "secure", "Scripts", "python.exe");
    const cameraService = path.join(projectRoot, "hardware", "camera", "camera_service.py");

    try {
        if (fs.existsSync(stopFile)) {
            fs.unlinkSync(stopFile);
        }

        const child = spawn(pythonPath, [cameraService], {
            cwd: path.dirname(cameraService),
            stdio: ["pipe", "pipe", "pipe"]
        });

        cameraProcess = child;
        recording = true;
        recordingSource = source;

        child.stdout.on("data", data => {
            const output = data.toString();
            const activeFile = output.match(/RECORDING_FILE:([A-Za-z0-9_.-]+)/);
            if (activeFile) {
                activeRecordingFilename = activeFile[1];
            }
            console.log(`Camera: ${output.trim()}`);
        });

        child.stderr.on("data", data => {
            console.error(`Camera Error: ${data.toString().trim()}`);
        });

        child.once("error", error => {
            console.error("Camera process failed to start:", error);
            clearTimeout(stopTimeout);
            stopTimeout = null;
            if (cameraProcess === child) {
                cameraProcess = null;
                recording = false;
                recordingSource = null;
                activeRecordingFilename = null;
                stopping = false;
            }
        });

        child.once("close", code => {
            console.log(`Camera process exited with code ${code}`);
            clearTimeout(stopTimeout);
            stopTimeout = null;
            if (cameraProcess === child) {
                cameraProcess = null;
                recording = false;
                recordingSource = null;
                activeRecordingFilename = null;
                stopping = false;
            }
        });

        return true;
    } catch (error) {
        console.error("Unable to start camera recording:", error);
        recording = false;
        recordingSource = null;
        cameraProcess = null;
        activeRecordingFilename = null;
        stopping = false;
        throw error;
    }
}

function stopCameraRecording() {
    if (!recording || !cameraProcess || stopping) {
        return false;
    }

    const processToStop = cameraProcess;
    // The Python recorder watches this marker so the Node process can request a graceful shutdown.
    fs.writeFileSync(stopFile, "STOP");
    stopping = true;
    clearTimeout(stopTimeout);

    stopTimeout = setTimeout(() => {
        if (cameraProcess === processToStop) {
            console.error("Camera service did not stop within the expected time; terminating it.");
            processToStop.kill();
        }
    }, 5000);

    return true;
}

function normalizeDays(days) {
    if (Array.isArray(days)) {
        return days;
    }

    if (typeof days === "string") {
        try {
            const parsed = JSON.parse(days);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
}

async function getSavedSchedule() {
    const [rows] = await db.query(
        "SELECT enabled, start_time, end_time, days, time_zone FROM camera_recording_schedules WHERE id = 1"
    );

    if (!rows.length) {
        return null;
    }

    const schedule = rows[0];
    return {
        enabled: Boolean(schedule.enabled),
        startTime: String(schedule.start_time).slice(0, 5),
        endTime: String(schedule.end_time).slice(0, 5),
        days: normalizeDays(schedule.days).map(Number),
        timeZone: schedule.time_zone
    };
}

async function enforceRecordingSchedule() {
    try {
        const schedule = await getSavedSchedule();
        const window = schedule ? getScheduleWindow(schedule) : null;

        if (!window) {
            startedScheduleWindow = null;
            if (recordingSource === "schedule") {
                stopCameraRecording();
            }
            return;
        }

        if (!recording && !cameraProcess && startedScheduleWindow !== window.key) {
            startedScheduleWindow = window.key;
            startCameraRecording("schedule");
        }
    } catch (error) {
        console.error("Unable to enforce camera recording schedule:", error);
    }
}

function getCameraStatus(req, res) {
    res.json({ recording, source: recordingSource });
}

function startRecording(req, res) {
    try {
        const started = startCameraRecording("manual");
        res.json({
            message: started ? "Recording started" : "Camera is already recording",
            recording: true
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to start recording" });
    }
}

function stopRecording(req, res) {
    try {
        const stopped = stopCameraRecording();
        res.json({
            message: stopped ? "Recording stopped" : "Camera is not recording",
            recording: stopped ? false : recording
        });
    } catch (error) {
        console.error("Error stopping camera:", error);
        res.status(500).json({ error: "Failed to stop recording" });
    }
}

async function listRecordings(req, res) {
    const recordingsDirectory = path.join(projectRoot, "uploads", "recordings");

    try {
        await fs.promises.mkdir(recordingsDirectory, { recursive: true });
        const entries = await fs.promises.readdir(recordingsDirectory, { withFileTypes: true });
        const recordings = await Promise.all(entries
            .filter(entry => entry.isFile() && /\.(avi|mp4|webm)$/i.test(entry.name))
            .map(async entry => {
                const stats = await fs.promises.stat(path.join(recordingsDirectory, entry.name));
                return {
                    id: entry.name,
                    filename: entry.name,
                    url: `/uploads/recordings/${encodeURIComponent(entry.name)}`,
                    createdAt: stats.mtime.toISOString(),
                    size: stats.size,
                    active: recording && entry.name === activeRecordingFilename
                };
            }));

        recordings.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
        res.json({ recordings });
    } catch (error) {
        console.error("Unable to list camera recordings:", error);
        res.status(500).json({ error: "Unable to load recordings" });
    }
}

async function deleteRecordings(req, res) {
    const { filenames } = req.body || {};
    const filenamePattern = /^recording_\d{8}_\d{6}\.(?:avi|mp4|webm)$/i;

    if (!Array.isArray(filenames) ||
        filenames.length === 0 ||
        filenames.length > 200 ||
        filenames.some(filename => typeof filename !== "string" ||
            !filenamePattern.test(filename) ||
            path.basename(filename) !== filename) ||
        new Set(filenames).size !== filenames.length) {
        return res.status(400).json({ error: "Provide a list of up to 200 unique valid recording filenames." });
    }

    const activeFilenames = filenames.filter(filename => filename === activeRecordingFilename && recording);
    if (activeFilenames.length > 0) {
        return res.status(409).json({
            error: "Stop the active recording before deleting it.",
            active: activeFilenames
        });
    }

    const recordingsDirectory = path.join(projectRoot, "uploads", "recordings");
    const deleted = [];
    const failed = [];

    for (const filename of filenames) {
        try {
            await fs.promises.unlink(path.join(recordingsDirectory, filename));
            deleted.push(filename);
        } catch (error) {
            failed.push({
                filename,
                error: error.code === "ENOENT" ? "Recording no longer exists." : "Unable to delete recording."
            });
        }
    }

    res.json({ deleted, failed });
}

async function getRecordingSchedule(req, res) {
    try {
        res.json({ schedule: await getSavedSchedule() });
    } catch (error) {
        console.error("Unable to load camera recording schedule:", error);
        res.status(500).json({ error: "Unable to load recording schedule" });
    }
}

async function updateRecordingSchedule(req, res) {
    const { enabled, startTime, endTime, days, timeZone } = req.body || {};
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (typeof enabled !== "boolean" ||
        !timePattern.test(startTime) ||
        !timePattern.test(endTime) ||
        startTime === endTime ||
        !Array.isArray(days) ||
        days.some(day => !Number.isInteger(day) || day < 0 || day > 6) ||
        new Set(days).size !== days.length ||
        (enabled && days.length === 0) ||
        typeof timeZone !== "string" ||
        timeZone.length > 64) {
        return res.status(400).json({ error: "Provide valid recording times, weekdays, and timezone." });
    }

    try {
        new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());

        await db.query(
            `INSERT INTO camera_recording_schedules
                (id, enabled, start_time, end_time, days, time_zone, updated_by)
             VALUES (1, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                enabled = VALUES(enabled),
                start_time = VALUES(start_time),
                end_time = VALUES(end_time),
                days = VALUES(days),
                time_zone = VALUES(time_zone),
                updated_by = VALUES(updated_by)`,
            [enabled, startTime, endTime, JSON.stringify(days), timeZone, req.user.id]
        );

        const schedule = await getSavedSchedule();
        await enforceRecordingSchedule();
        res.json({ schedule });
    } catch (error) {
        if (error instanceof RangeError) {
            return res.status(400).json({ error: "The timezone is not valid." });
        }

        console.error("Unable to save camera recording schedule:", error);
        res.status(500).json({ error: "Unable to save recording schedule" });
    }
}

async function getMotionSettings(req, res) {
    try {
        res.json({ motionDetection: await getMotionDetectionSettings() });
    } catch (error) {
        console.error("Unable to load motion detection settings:", error);
        res.status(500).json({ error: "Unable to load motion detection settings" });
    }
}

async function updateMotionSettings(req, res) {
    const { enabled, failsafeEnabled, failsafeTime, timeZone } = req.body || {};
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (typeof enabled !== "boolean" ||
        typeof failsafeEnabled !== "boolean" ||
        !timePattern.test(failsafeTime) ||
        typeof timeZone !== "string" ||
        timeZone.length > 64) {
        return res.status(400).json({ error: "Provide valid motion detection settings." });
    }

    try {
        new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
        const motionDetection = await saveMotionDetectionSettings({
            enabled,
            failsafeEnabled,
            failsafeTime,
            timeZone
        }, req.user.id);
        res.json({ motionDetection });
    } catch (error) {
        if (error instanceof RangeError) {
            return res.status(400).json({ error: "The timezone is not valid." });
        }

        console.error("Unable to save motion detection settings:", error);
        res.status(500).json({ error: "Unable to save motion detection settings" });
    }
}

setInterval(enforceRecordingSchedule, 15000);
enforceRecordingSchedule();

module.exports = {
    getCameraStatus,
    startRecording,
    stopRecording,
    listRecordings,
    deleteRecordings,
    getRecordingSchedule,
    updateRecordingSchedule,
    getMotionSettings,
    updateMotionSettings
};

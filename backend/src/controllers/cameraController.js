const { spawn } = require("child_process");
const path = require("path");

let recording = false;
let cameraProcess = null;


function getCameraStatus(req, res) {

    res.json({
        recording: recording
    });

}


function startRecording(req, res) {

    if (recording) {

        return res.json({

            message: "Camera is already recording",

            recording: true

        });

    }


    const projectRoot = path.join(
        __dirname,
        "../../../"
    );


    const pythonPath = path.join(
        projectRoot,
        "secure",
        "Scripts",
        "python.exe"
    );


    const cameraService = path.join(
        projectRoot,
        "hardware",
        "camera",
        "camera_service.py"
    );


    console.log(
        "Starting Python camera service..."
    );


    cameraProcess = spawn(
        pythonPath,
        [cameraService],
        {
            cwd: path.dirname(cameraService),
            stdio: ["pipe", "pipe", "pipe"]
        }
    );


    cameraProcess.stdout.on(
        "data",
        (data) => {

            console.log(
                `Camera: ${data.toString().trim()}`
            );

        }
    );


    cameraProcess.stderr.on(
        "data",
        (data) => {

            console.error(
                `Camera Error: ${data.toString().trim()}`
            );

        }
    );


    cameraProcess.on(
        "close",
        (code) => {

            console.log(
                `Camera process exited with code ${code}`
            );

            recording = false;
            cameraProcess = null;

        }
    );


    recording = true;


    res.json({

        message: "Recording started",

        recording: true

    });

}


function stopRecording(req, res) {

    if (!recording || !cameraProcess) {

        return res.json({

            message: "Camera is not recording",

            recording: false

        });

    }


    console.log(
        "Stopping Python camera service..."
    );


    cameraProcess.stdin.write("\x03");


    cameraProcess = null;

    recording = false;


    res.json({

        message: "Recording stopped",

        recording: false

    });

}


module.exports = {

    getCameraStatus,

    startRecording,

    stopRecording

};
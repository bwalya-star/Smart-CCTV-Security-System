import os
import sys
import serial
import serial.tools.list_ports
import requests

# Add hardware directory to Python path
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)



PORT = "COM7"
BAUD_RATE = 9600

CAMERA_URL = "http://127.0.0.1:8000/capture"

BACKEND_URL = "http://localhost:5000/api/alerts"

DEVICE_CODE = "CCTV-0001"
DEVICE_SECRET = "3182c8dada7eb438092af42029df581527c382a8bdd6859f3c97ad9e7ddda47b"


def find_serial_port():
    ports = serial.tools.list_ports.comports()

    for port in ports:
        if (
            "Arduino" in port.description
            or "USB-SERIAL CH340" in port.description
        ):
            print(
                f"Found Arduino-like device on "
                f"{port.device} ({port.description})"
            )

            return port.device

    return None


def open_serial():

    port = find_serial_port() or PORT

    try:

        ser = serial.Serial(
            port,
            BAUD_RATE,
            timeout=1
        )

        print(
            f"Connected to serial port {port}."
        )

        return ser

    except serial.SerialException as e:

        print(
            f"Could not open serial port "
            f"{port}: {e}"
        )

        return None


def send_alert_to_backend(image_path):

    try:

        response = requests.post(
            BACKEND_URL,
            json={
                "imagePath": image_path
            },
            headers={
                "X-Device-Code": DEVICE_CODE,
                "X-Device-Secret": DEVICE_SECRET
            },
            timeout=10
        )

        print(
            f"Backend response: "
            f"{response.status_code}"
        )

        print(
            response.text
        )

        return response.ok

    except requests.Timeout as e:

        print(
            f"Failed to post alert: request timed out ({e})"
        )

        return False

    except requests.ConnectionError as e:

        print(
            f"Failed to post alert: connection error ({e})"
        )

        return False

    except requests.RequestException as e:

        print(
            f"Failed to post alert: {e}"
        )

        return False


def capture_from_camera_manager():

    try:

        print(
            "Requesting image from Camera Manager..."
        )

        response = requests.post(
            CAMERA_URL,
            timeout=15
        )


        if response.status_code != 200:

            print(
                f"Camera Manager error: "
                f"{response.status_code}"
            )

            return None


        data = response.json()


        if not data.get("success"):

            print(
                "Camera Manager failed to capture image."
            )

            return None


        image_path = data.get(
            "imagePath"
        )


        print(
            f"Image captured: {image_path}"
        )


        return image_path


    except requests.RequestException as error:

        print(
            f"Could not contact Camera Manager: "
            f"{error}"
        )

        return None


def main():

    ser = open_serial()

    if ser is None:
        sys.exit(1)

    print(
        "Listening for Arduino..."
    )

    try:

        while True:

            raw = ser.readline()

            if not raw:
                continue

            message = raw.decode(
                "utf-8",
                errors="replace"
            ).strip()

            if not message:
                continue

            print(
                f"Serial: {message}"
            )

            # ==================================
            # MOTION DETECTED
            # ==================================

            if message == "MOTION_DETECTED":

                print(
                    "Motion detected!"
                )

                image_path = capture_from_camera_manager()

                if image_path:

                    print(
                        f"Image captured: "
                        f"{image_path}"
                    )

                    # Send alert to backend
                    success = send_alert_to_backend(
                        image_path
                    )

                    if success:

                        print(
                            "Alert successfully "
                            "sent to backend."
                        )

                    else:

                        print(
                            "Alert could not "
                            "be sent to backend."
                        )

                else:

                    print(
                        "No image captured."
                    )

    except KeyboardInterrupt:

        print(
            "\nStopping bridge..."
        )

    finally:

        if ser.is_open:

            ser.close()

            print(
                "Serial port closed."
            )


if __name__ == "__main__":
    main()
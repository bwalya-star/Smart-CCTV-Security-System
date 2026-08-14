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

from camera.capture import capture_image


PORT = "COM7"
BAUD_RATE = 9600

BACKEND_URL = "http://127.0.0.1:5000/api/alerts"


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

                # Capture image
                image_path = capture_image()

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
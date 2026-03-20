from flask import Flask, request, jsonify
import cv2

app = Flask(__name__)
@app.route('/detect', methods=['POST'])
def detect():
    # Place holder for AI detection logic
    return jsonify({"message": "Detection completed", "status": "success"})

if __name__ == '__main__':
    app.run(port=8000)
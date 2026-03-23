from flask import Flask, request, jsonify
import cv2

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    image = data.get('image')  
    # Place holder for AI detection logic
    detected = True if image else False
    return jsonify({
        'detected': True,
        "image": image
    })

if __name__ == '__main__':
    app.run(port=8000)
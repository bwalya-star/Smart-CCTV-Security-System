from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    image = data.get("image")

    # TEMP LOGIC (improved)
    detected = True if image else False

    return jsonify({
        "detected": detected,
        "confidence": 0.87,
        "label": "person"
    })

if __name__ == '__main__':
    app.run(port=8000)
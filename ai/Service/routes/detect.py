from flask import Blueprint, request, jsonify
from aiService import detect_person


detect_bp = Blueprint(
    "detect",
    __name__
)


@detect_bp.route(
    "/detect",
    methods=["POST"]
)
def detect():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No JSON data received"
            }), 400

        image_path = data.get(
            "imagePath"
        )

        if not image_path:

            return jsonify({
                "error": "imagePath is required"
            }), 400

        result = detect_person(
            image_path
        )

        return jsonify(result), 200

    except Exception as error:

        print(
            "AI detection error:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500
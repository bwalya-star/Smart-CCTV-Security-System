import base64
import binascii
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
from aiService import detect_person, face_recognition_module


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
            image_path,
            data.get("userId")
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


@detect_bp.route(
    "/validate-enrollment",
    methods=["POST"]
)
def validate_enrollment():
    data = request.get_json()
    images = data.get("images") if data else None
    if not isinstance(images, list) or not 5 <= len(images) <= 10:
        return jsonify({
            "valid": False,
            "error": "Upload between 5 and 10 face images."
        }), 400

    decoded_images = []
    face_embeddings = []
    total_bytes = 0
    try:
        for encoded_image in images:
            if not isinstance(encoded_image, str):
                raise ValueError("An uploaded image is invalid.")

            image_bytes = base64.b64decode(encoded_image, validate=True)
            total_bytes += len(image_bytes)
            # Enforce both limits before decoding buffers to avoid excessive memory use.
            if len(image_bytes) > 4 * 1024 * 1024 or total_bytes > 20 * 1024 * 1024:
                raise ValueError("Uploaded images exceed the allowed size.")

            image = cv2.imdecode(
                np.frombuffer(image_bytes, dtype=np.uint8),
                cv2.IMREAD_COLOR
            )
            if image is None:
                raise ValueError("One or more uploaded files are not valid images.")

            faces = face_recognition_module.app.get(image)
            if len(faces) != 1:
                raise ValueError("Each image must contain exactly one clear face.")

            embedding = faces[0].embedding
            # Unit-length embeddings make the dot product comparable to cosine similarity.
            embedding = embedding / np.linalg.norm(embedding)
            face_embeddings.append(embedding)

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            resized = cv2.resize(gray, (32, 32), interpolation=cv2.INTER_AREA)
            dct = cv2.dct(np.float32(resized))
            low_frequency = dct[:8, :8]
            median = np.median(low_frequency[1:, 1:])
            perceptual_hash = low_frequency > median
            decoded_images.append(perceptual_hash)

        # Reject duplicate/near-duplicate views before checking that all faces match.
        for index, image_hash in enumerate(decoded_images):
            for previous_hash in decoded_images[:index]:
                if np.count_nonzero(image_hash != previous_hash) <= 4:
                    raise ValueError("The images must be different views; duplicate or near-identical photos were found.")

        threshold = face_recognition_module.recognition_threshold
        # Enrollment photos must be similar to one another, not merely individually detectable.
        for index, embedding in enumerate(face_embeddings):
            for previous_embedding in face_embeddings[:index]:
                if float(np.dot(embedding, previous_embedding)) < threshold:
                    raise ValueError("All photos must show the same person.")

        return jsonify({"valid": True, "count": len(decoded_images)}), 200
    except (ValueError, binascii.Error) as error:
        return jsonify({"valid": False, "error": str(error)}), 400
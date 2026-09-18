from dotenv import load_dotenv
from flask import Flask

from routes.detect import detect_bp

load_dotenv()


app = Flask(__name__)


app.register_blueprint(
    detect_bp,
    url_prefix="/api"
)


@app.route("/")
def home():

    return {
        "service": "Smart CCTV AI Service",
        "status": "running"
    }


if __name__ == "__main__":

    print(
        "Starting Smart CCTV AI Service..."
    )

    app.run(
        host="127.0.0.1",
        port=8001,
        debug=False
    )
import insightface


print("\n========================================")
print("INSIGHTFACE TEST")
print("========================================")

print("Loading face analysis model...")

app = insightface.app.FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

print("InsightFace loaded successfully.")

print("\n========================================")
print("TEST COMPLETE")
print("========================================")
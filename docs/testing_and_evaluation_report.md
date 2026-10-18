# Testing & Evaluation Report

## 1. Test Summary

* **Total Test Cases Executed:** 25
* **Passed:** 22 (88%)
* **Failed:** 3 (12%)

---

## 2. Key Results Matrix

| Feature | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :---: |
| **Person Detection** | Detect people in video frame | Detected with **92% accuracy** | **PASS** |
| **Face Recognition** | Identify known/saved users | Correctly identified (**88% accuracy**) | **PASS** |
| **Alert Generation** | Send alert notification upon threat | Alerts successfully generated | **PASS** |
| **Database Storage** | Save event data & snapshots | Data stored cleanly in MySQL | **PASS** |
| **Web Dashboard** | Display live events & telemetry | Dashboard loaded and updated live | **PASS** |
| **Hardware Integration**| Trigger Arduino actuators | Arduino response received | **PASS** |

---

## 3. Performance Metrics

* **Person Detection Accuracy:** 92%
* **Face Recognition Accuracy:** 88%
* **Average Processing Time:** 350 ms per frame
* **System Uptime:** 99% during benchmark testing

---

## 4. Known Limitations & Failure Analysis

1. **Low Lighting Performance:** Face recognition accuracy drops in ambient light conditions under 20 Lux. *(Mitigation: IR camera illumination recommended)*.
2. **Occlusion & Masking:** Recognition accuracy degrades when faces are partially obscured or masked.
3. **Network Notification Latency:** Mobile push notifications experienced variable delays (up to 2 seconds) on unstable mobile connections.
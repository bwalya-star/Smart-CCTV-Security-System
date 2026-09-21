require("dotenv").config();

const {
  shouldNotify,
  sendNotification
} = require("./src/services/notificationService");


async function runTests() {

  console.log("\n===== NOTIFICATION SERVICE TEST =====\n");


  const knownPerson = {
    alert_classification: "KNOWN_PERSON",
    severity: "LOW",
    identity_name: "bwalya",
    face_similarity: 0.632,
    image_path: "/uploads/test.jpg"
  };


  const unknownPerson = {
    alert_classification: "UNKNOWN_PERSON",
    severity: "HIGH",
    identity_name: "unknown",
    face_similarity: 0.21,
    image_path: "/uploads/test.jpg"
  };


  const unidentifiedPerson = {
    alert_classification: "UNIDENTIFIED_PERSON",
    severity: "MEDIUM",
    identity_name: "no_face",
    face_similarity: 0,
    image_path: "/uploads/test.jpg"
  };


  const noPerson = {
    alert_classification: "NO_PERSON",
    severity: "INFO",
    identity_name: "no_person",
    face_similarity: 0,
    image_path: "/uploads/test.jpg"
  };


  console.log("KNOWN PERSON:");
  console.log(
    "Should notify:",
    shouldNotify(knownPerson)
  );


  console.log("\nUNKNOWN PERSON:");
  console.log(
    "Should notify:",
    shouldNotify(unknownPerson)
  );


  console.log("\nUNIDENTIFIED PERSON:");
  console.log(
    "Should notify:",
    shouldNotify(unidentifiedPerson)
  );


  console.log("\nNO PERSON:");
  console.log(
    "Should notify:",
    shouldNotify(noPerson)
  );


  console.log("\n===== TESTING SEND NOTIFICATION =====\n");


  console.log("Known person:");
  await sendNotification(knownPerson);


  console.log("\nUnknown person:");
  await sendNotification(unknownPerson);


  console.log("\nUnidentified person:");
  await sendNotification(unidentifiedPerson);


  console.log("\nNo person:");
  await sendNotification(noPerson);


  console.log("\n===== TEST COMPLETE =====\n");
}


runTests();
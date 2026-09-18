require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

  host: process.env.EMAIL_HOST,

  port: Number(
    process.env.EMAIL_PORT || 587
  ),

  secure: false,

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASSWORD

  }

});


async function testEmail() {

  console.log(
    "\n===== EMAIL CONFIGURATION TEST =====\n"
  );


  console.log(
    "Email user:",
    process.env.EMAIL_USER
  );


  console.log(
    "Alert recipient:",
    process.env.ALERT_EMAIL
  );


  try {

    await transporter.verify();


    console.log(
      "\nSMTP connection successful."
    );


    const info =
      await transporter.sendMail({

        from:
          `"Smart CCTV Security System" <${process.env.EMAIL_USER}>`,

        to:
          process.env.ALERT_EMAIL,

        subject:
          "Smart CCTV Email Test",

        text:
          "This is a test email from the Smart CCTV Security System."

      });


    console.log(
      "\nTest email sent successfully."
    );


    console.log(
      "Message ID:",
      info.messageId
    );


  } catch (error) {

    console.error(
      "\nEmail test failed:"
    );

    console.error(
      error.message
    );

  }

}


testEmail();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {};

app.get("/", (req, res) => {
  res.send("Talent Enhancer Backend Running");
});

app.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.json({ success: false, error: "Mobile required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[mobile] = otp;

  console.log("OTP:", otp);

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "91" + mobile,
        type: "text",
        text: {
          body: `Your OTP is ${otp}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, otp, mode: "TEXT_OTP" });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.json({ success: false, error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  if (otpStore[mobile] === otp) {
    delete otpStore[mobile];
    return res.json({ success: true });
  }

  res.json({ success: false });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
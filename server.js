require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {}; // mobile → otp

// ✅ SEND OTP
app.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Mobile required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[mobile] = otp;

  try {
    const metaResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `91${mobile}`,
        type: "template",
template: {
  name: "hello_world",
  language: {
    code: "en_US",
  },
},
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Meta response:", metaResponse.data);
    res.json({ success: true });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  if (otpStore[mobile] === otp) {
    delete otpStore[mobile];
    return res.json({ success: true });
  }

  res.status(400).json({ error: "Invalid OTP" });
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
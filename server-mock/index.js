require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MOCK CONFIGURATIONS
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'; 

let client;
try {
  client = twilio(TWILIO_SID, TWILIO_TOKEN);
} catch (e) {
  console.warn("Twilio Client failed to initialize. Using console mockers.");
}

app.post('/api/notify/status', async (req, res) => {
  const { recipientPhone, name, cropType, status, trackingId, language = 'en' } = req.body;
  try {
    let messageBody = '';
    const link = `https://agrolink.app/track/${trackingId}`;
    if (status === 'in-transit') {
      messageBody = `Hello ${name}, your ${cropType} shipment #${trackingId} is now IN TRANSIT. Track here: ${link}`;
    } else if (status === 'delivered') {
      messageBody = `Hello ${name}, your ${cropType} shipment #${trackingId} has been successfully DELIVERED! Details: ${link}`;
    } else if (status === 'delayed') {
      messageBody = `ALERT ${name}: Your ${cropType} shipment #${trackingId} has been DELAYED. Please check the tracker: ${link}`;
    } else if (status === 'pending') {
      messageBody = `Hello ${name}, your ${cropType} shipment #${trackingId} is PENDING pickup. Link: ${link}`;
    }

    if (client && TWILIO_TOKEN !== 'your_auth_token') {
       await client.messages.create({
         body: messageBody,
         from: TWILIO_NUMBER,
         to: `whatsapp:${recipientPhone}`
       });
       console.log(`Live WhatsApp pushed to ${recipientPhone}`);
    } else {
       console.log(`[MOCK TWILIO] Sending WhatsApp to ${recipientPhone}:\n  "${messageBody}"`);
    }

    res.status(200).json({ success: true, message: 'Notification queued successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/webhook/twilio', (req, res) => {
   const incomingMsg = req.body.Body || '';
   const fromSender = req.body.From || '';
   console.log(`[TWILIO WEBHOOK] Received message from ${fromSender}: ${incomingMsg}`);
   const twiml = new twilio.twiml.MessagingResponse();
   twiml.message("AgroLink: We have received your update and logged it into the system.");
   res.writeHead(200, { 'Content-Type': 'text/xml' });
   res.end(twiml.toString());
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
   console.log(`🚜 AgroLink Twilio Mock Server online at http://localhost:${PORT}`);
});

server.on('error', (err) => {
   console.error('Server Error:', err);
});

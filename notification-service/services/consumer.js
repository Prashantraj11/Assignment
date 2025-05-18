require('dotenv').config();

const connectDB = require('../config/database');
connectDB();


const amqp = require('amqplib');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(message) {
  const mailOptions = {
    from: `"Notification Service" <${process.env.EMAIL_USER}>`,
    to: 'recipient@example.com',
    subject: 'Notification',
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${message}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function sendSMS(message) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: process.env.TWILIO_TEST_PHONE  
    });
    console.log(`SMS sent: ${message}`);
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

async function sendInApp(message) {
  console.log(`In-App Notification: ${message}`);
  return true;
}

async function startConsumer() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'notifications';

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log('Waiting for notifications...');

    channel.consume(queue, async (msg) => {
      const data = JSON.parse(msg.content.toString());
      console.log('Received:', data);

      try {
        const { type, message } = data;
        let success = false;

        if (type === 'email') success = await sendEmail(message);
        else if (type === 'sms') success = await sendSMS(message);
        else if (type === 'in-app') success = await sendInApp(message);
        else throw new Error('Unsupported notification type');

        if (success) {
          const notification = new Notification({ ...data, status: 'sent' });
          await notification.save();
          console.log('Notification sent and saved.');
          channel.ack(msg);
        } else {
          throw new Error('Sending failed');
        }
      } catch (err) {
        console.error('Error:', err.message);

        let retries = msg.properties.headers['x-retry'] || 0;
        if (retries < 3) {
          console.log(`Retrying (${retries + 1}/3)...`);
          channel.nack(msg, false, false);
          channel.sendToQueue(queue, msg.content, {
            headers: { 'x-retry': retries + 1 },
            persistent: true
          });
        } else {
          console.log('Dropping after 3 failed attempts.');
          const failedNotification = new Notification({ ...data, status: 'failed' });
          await failedNotification.save();
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Failed to start consumer:', error);
  }
}

startConsumer();

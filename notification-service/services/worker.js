const amqp = require('amqplib');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname')
  .then(() => console.log('Worker connected to MongoDB'))
  .catch(err => console.error('MongoDB Error in worker:', err));

async function startWorker() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'notificationQueue';

    await channel.assertQueue(queue, { durable: true });

    console.log('Worker is waiting for messages.....');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log(`Received job:`, data);
        console.log(`Sending ${data.type} notification to ${data.recipient}: ${data.content}`);
        await Notification.create({
          type: data.type,
          recipient: data.recipient,
          content: data.content,
          user: data.userId,
          status: 'sent',
          sentAt: new Date(),
        });

        channel.ack(msg);
        console.log(`Notification processed for: ${data.recipient}`);
      }
    }, { noAck: false });

  } catch (error) {
    console.error('Worker Error:', error);
  }
}

startWorker();

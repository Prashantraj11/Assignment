const amqp = require('amqplib');

async function publishNotification(notification) {
  const queue = 'notifications';
  let connection;
  let channel;

  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)), { persistent: true });

    console.log('Enqueued notification:', notification);
  } catch (error) {
    console.error('Failed to publish notification:', error);
    throw error;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

module.exports = publishNotification;
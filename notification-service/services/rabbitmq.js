const amqp = require('amqplib');

async function testConnection() {
  try {
    console.log('Attempting to connect to RabbitMQ...');
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connection successful!');
    
    const channel = await connection.createChannel();
    console.log('Channel created successfully!');
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('RabbitMQ Connection Error:', error);
  }
}

testConnection();
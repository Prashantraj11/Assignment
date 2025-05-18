# Notification Services

A robust notification service built with Node.js that handles various types of notifications through different channels. This service is designed to be scalable, maintainable, and easy to integrate with other services.

## Project Structure

```
notification-services/
├── index.js              # Main application entry point
├── notificationRoutes.js # API routes for notification endpoints
├── consumer.js           # Message consumer for handling async notifications
├── package.json          # Project dependencies and scripts
└── README.md            # Project documentation
```

## Components

### 1. index.js
The main entry point of the application that:
- Sets up the Express server
- Configures middleware
- Initializes database connections
- Sets up error handling
- Starts the notification consumer
- Exports the Express app for testing

### 2. notificationRoutes.js
Contains all the API routes for notification-related operations:
- Send notifications
- Get notification history
- Update notification status
- Delete notifications
- Configure notification preferences

### 3. consumer.js
Handles asynchronous notification processing:
- Listens to message queues
- Processes notification requests
- Handles retry logic
- Manages notification delivery status

## Prerequisites

Before running this project, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)
- RabbitMQ (v3.8 or higher) - for message queuing

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd notification-services
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/notification-service
   RABBITMQ_URL=amqp://localhost
   JWT_SECRET=your_jwt_secret
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - Create necessary indexes and collections
   ```bash
   npm run setup-db
   ```

5. **Message Queue Setup**
   - Start RabbitMQ server
   - Configure queues and exchanges

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Running the Consumer**
   The consumer.js file needs to be running in a separate terminal window to process notifications. You can start it using:
   ```bash
   node consumer.js
   ```
   
   The consumer will:
   - Connect to RabbitMQ message queues
   - Listen for new notification requests
   - Process notifications asynchronously
   - Handle retries for failed notifications
   - Update notification status in the database

   Note: Make sure your RabbitMQ server is running before starting the consumer.

## API Endpoints

### Notification Routes

1. **Send Notification**
   ```
   POST /api/notifications
   Content-Type: application/json
   
   {
     "type": "email",
     "recipient": "user@example.com",
     "subject": "Notification Subject",
     "content": "Notification Content"
   }
   ```

2. **Get Notifications**
   ```
   GET /api/notifications
   ```

3. **Get Notification by ID**
   ```
   GET /api/notifications/:id
   ```

4. **Update Notification Status**
   ```
   PATCH /api/notifications/:id
   ```

5. **Delete Notification**
   ```
   DELETE /api/notifications/:id
   ```
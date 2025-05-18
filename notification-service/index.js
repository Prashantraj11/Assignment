require('dotenv').config();

const express = require('express');
const connectDB = require('./config/database');
const notificationRoutes = require('./routes/notificationRoutes');
const User = require('./models/User');

const app = express();

connectDB();

app.use(express.json());

app.use('/api', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Notification Service API is running');
});

async function createTestUser() {
  try {
    const existingUser =await User.findOne({email: 'test@example.com'});

    if (!existingUser) {
      const newUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
      });

      await newUser.save();
      console.log('Test user created:', newUser._id);
      return newUser._id;
    } else {
      console.log('Test user already exists:', existingUser._id);
      return existingUser._id;
    }
  } catch (error) {
    console.error('Failed to create test user:', error);
  }
}

const PORT =process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // // const testUserId = await createTestUser();
  // if (testUserId) {
  //   console.log(`👤 Use this userId for testing notifications: ${testUserId}`);
  // }
});

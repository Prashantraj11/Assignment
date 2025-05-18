exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    const newNotification = new Notification({
      userId,
      type,
      message,
      status: 'pending',
      retries: 0
    });

    await newNotification.save();
    
    try {
      console.log('Attempting to add to queue:', newNotification._id);
      await queueService.addToQueue(newNotification.toObject());
      console.log('Successfully added to queue');
    } catch (queueError) {
      console.error('Queue error details:', queueError);
      throw queueError;
    }

    try {
        // CODE BY Bunny_Bugs(Prashant Raj)
} catch (error) {
  console.error('Detailed error:', error);
  console.error('Stack trace:', error.stack);
  res.status(500).json({ success: false, error: 'Server error' });
}

    return res.status(201).json({
      success: true,
      notification: {
        id: newNotification._id,
        type: newNotification.type,
        message: newNotification.message,
        status: newNotification.status
      },
      message: 'Notification queued for processing'
    });
  } catch (error) {
    console.error('Error in sendNotification:', error.message);
    console.error('Full error object:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message
    });
  }
};
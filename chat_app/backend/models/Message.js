// models/Message.js

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  receiver: String,
  imagePath: String,
  timestamp: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete messages 24 hours after creation
  }
});

export default mongoose.model('Message', messageSchema);
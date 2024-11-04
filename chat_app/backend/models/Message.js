import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  text: { type: String },
  imagePath: { type: String },
  receiver: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Set TTL index to automatically delete messages older than 24 hours
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

const Message = mongoose.model('Message', MessageSchema);

export default Message;
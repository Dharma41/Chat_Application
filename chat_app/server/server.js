import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import multer from 'multer';
import { createServer } from 'http'; // To create HTTP server for Socket.IO
import { Server } from 'socket.io'; // Import Socket.IO server
import Message from './models/Message.js'; // Import Message model

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app); // Create an HTTP server for Socket.IO

// Initialize Socket.IO with the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Allow connection from your frontend
  }
});

const upload = multer({ dest: 'uploads/' }); // Configure multer to handle file uploads

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));

// Session setup for passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chat-app')
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Password will be null for Google-authenticated users
  googleId: { type: String }, // For storing Google ID for users who authenticate via Google
});

const User = mongoose.model('User', UserSchema);

// Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5001/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const username = profile.displayName;
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      username,
      email: profile.emails[0].value,
      googleId: profile.id
    });
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'User not found or invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:3000/chat?token=${token}`);
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
});

const users = {}; // To store users and their socket IDs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register the user with their socket ID
  socket.on('register-user', (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username}`);
  });

  // Handle incoming messages
  socket.on('send-message', async (messageData) => {
    const { text, receiver, sender } = messageData;

    // Save the message to the database
    try {
      const message = await Message.create({
        text,
        receiver,
        sender,
        timestamp: new Date(),
      });

      // Send message to the specific receiver
      const receiverSocket = users[receiver];
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive-message', message);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the user from the users list
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});

// Fetch users route for search functionality
app.get('/users', async (req, res) => {
  const { search } = req.query;
  try {
    const users = await User.find({ username: { $regex: search, $options: 'i' } });
    res.status(200).json(users.map(user => user.username));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message route for file uploads
app.post('/send-message', upload.single('image'), async (req, res) => {
  const { text, receiver, sender } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const message = await Message.create({
      text,
      imagePath,
      receiver,
      sender,
      timestamp: new Date(),
    });

    const receiverSocket = users[receiver];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive-message', message);
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
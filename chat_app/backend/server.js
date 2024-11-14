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
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
  }
});

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, optionsSuccessStatus: 200 }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Atlas connection using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch((error) => console.error('MongoDB connection error:', error));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.REACT_APP_SERVER_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let username = profile.displayName;
  
      // Check if a user with this Google ID already exists
      let user = await User.findOne({ googleId: profile.id });
  
      if (!user) {
        // Check if the username is already in use
        let existingUsername = await User.findOne({ username });
  
        // Generate a unique username if necessary
        while (existingUsername) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
          username = `${profile.displayName}_${randomSuffix}`;
          existingUsername = await User.findOne({ username: username });
        }
  
        // Check if email is already in use with a different account
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
          // Link Google ID to the existing user account with the same email
          existingEmailUser.googleId = profile.id;
          await existingEmailUser.save();
          user = existingEmailUser;
        } else {
          // Create a new user with a unique username and the provided Google email
          user = new User({
            username,
            email,
            googleId: profile.id
          });
          await user.save();
        }
      }
      return done(null, user);
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

//To test for backend sever

app.get('/', (req, res) => {
  res.send('Backend is running after deplyment!');
});

// Register route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash the password and create a new user if validations pass
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
    res.redirect(`${process.env.FRONTEND_URL}/chat?token=${token}`);
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

  socket.on('register-user', (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username}`);
  });

  socket.on('send-message', async (messageData) => {
    const { text, receiver, sender, imagePath } = messageData;
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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});

app.post('/send-message', upload.single('image'), async (req, res) => {
  const { text, receiver, sender } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

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
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/users', async (req, res) => {
  const { search } = req.query;
  try {
    const users = await User.find({ username: { $regex: search, $options: 'i' } });
    res.status(200).json(users.map(user => user.username));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch messages between two users (server-side filtering)
app.get('/messages', async (req, res) => {
  const { sender, receiver } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ],
      createdAt: { $gte: new Date(Date.now() - 86400 * 1000) } // Only fetch messages from the past 24 hours
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/recent-chats', async (req, res) => {
  const { user } = req.query;
  try {
    // Fetch distinct senders and receivers where the current user is involved
    const recentChats = await Message.find({
      $or: [{ sender: user }, { receiver: user }],
    })
      .sort({ timestamp: -1 }) // Sort by the latest message
      .limit(10); // Limit to 10 recent chats (you can adjust as needed)

    // Extract unique usernames from the chat messages
    const users = new Set();
    recentChats.forEach((chat) => {
      if (chat.sender !== user) users.add(chat.sender);
      if (chat.receiver !== user) users.add(chat.receiver);
    });

    res.status(200).json(Array.from(users));
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({ error: "Failed to fetch recent chats" });
  }
});

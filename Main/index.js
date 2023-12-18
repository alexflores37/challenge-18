const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect('your_mongodb_uri', { useNewUrlParser: true, useUnifiedTopology: true });

// Define MongoDB schemas and models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const thoughtSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Thought = mongoose.model('Thought', thoughtSchema);

// Middleware
app.use(bodyParser.json());

// Routes

// User registration
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Post a thought
app.post('/api/thoughts', async (req, res) => {
  try {
    const newThought = await Thought.create(req.body);
    res.status(201).json(newThought);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// React to a thought
app.post('/api/thoughts/:thoughtId/react', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    thought.reactions.push(req.body.reaction);
    await thought.save();

    res.json(thought);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a friend
app.post('/api/users/:userId/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friend = await User.findById(req.body.friendId);
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    user.friends.push(friend._id);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find().populate('user', 'username');
    res.json(thoughts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// server/routes/users.js
import express from 'express';
import User from '../models/User.model';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json(users);
  } catch (err: unknown) {
    res.status(500).json({ error: `Failed to fetch users ${err}` });
  }
});

// get single user
router.get('/:id', async (req, res) => {
  try {
    const users = await User.findById(req.params.id); // exclude password
    res.json(users);
  } catch (error: unknown) {
    res.status(500).json({ error: `Failed to fetch user ${error}` });
  }
});
// Create a new user
router.post('/', async (req, res) => {
  const { name, email, profilePic } = req.body;
  try {
    const newUser = new User({ name, email, profilePic });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: `User creation failed ${err}` });
  }
});

export default router;

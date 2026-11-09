const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://scioptimal-fitness.netlify.app',
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage
const inMemoryDB = {
  users: new Map(),
  profiles: new Map(),
  workouts: new Map(),
  nutrition: new Map(),
  sleep: new Map(),
  progress: new Map(),
  trainingPhases: new Map()
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Generate simple IDs
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// Routes

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = Array.from(inMemoryDB.users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = generateId();
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    inMemoryDB.users.set(userId, user);
    
    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = Array.from(inMemoryDB.users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simple Profile Creation (no auth required for now)
app.post('/api/user/profile', async (req, res) => {
  try {
    const profileData = req.body;
    const profileId = generateId();
    
    const profile = {
      id: profileId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in memory
    inMemoryDB.profiles.set(profileId, profile);
    
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Profile by ID
app.get('/api/user/profile/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Try in-memory first
    if (inMemoryDB.profiles.has(profileId)) {
      return res.json(inMemoryDB.profiles.get(profileId));
    }
    
    res.status(404).json({ message: 'Profile not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simple endpoints for other data (no auth required for now)
app.post('/api/workouts', async (req, res) => {
  try {
    const workoutData = req.body;
    const workoutId = generateId();
    
    const workout = {
      id: workoutId,
      ...workoutData,
      createdAt: new Date()
    };
    
    inMemoryDB.workouts.set(workoutId, workout);
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/workouts', async (req, res) => {
  try {
    const workouts = Array.from(inMemoryDB.workouts.values());
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/nutrition', async (req, res) => {
  try {
    const nutritionData = req.body;
    const nutritionId = generateId();
    
    const nutrition = {
      id: nutritionId,
      ...nutritionData,
      createdAt: new Date()
    };
    
    inMemoryDB.nutrition.set(nutritionId, nutrition);
    res.status(201).json(nutrition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/nutrition', async (req, res) => {
  try {
    const nutrition = Array.from(inMemoryDB.nutrition.values());
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/sleep', async (req, res) => {
  try {
    const sleepData = req.body;
    const sleepId = generateId();
    
    const sleep = {
      id: sleepId,
      ...sleepData,
      createdAt: new Date()
    };
    
    inMemoryDB.sleep.set(sleepId, sleep);
    res.status(201).json(sleep);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/sleep', async (req, res) => {
  try {
    const sleep = Array.from(inMemoryDB.sleep.values());
    res.json(sleep);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/progress', async (req, res) => {
  try {
    const progressData = req.body;
    const progressId = generateId();
    
    const progress = {
      id: progressId,
      ...progressData,
      createdAt: new Date()
    };
    
    inMemoryDB.progress.set(progressId, progress);
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/progress', async (req, res) => {
  try {
    const progress = Array.from(inMemoryDB.progress.values());
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/training-phases', async (req, res) => {
  try {
    const phaseData = req.body;
    const phaseId = generateId();
    
    const phase = {
      id: phaseId,
      ...phaseData,
      createdAt: new Date()
    };
    
    inMemoryDB.trainingPhases.set(phaseId, phase);
    res.status(201).json(phase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/training-phases', async (req, res) => {
  try {
    const phases = Array.from(inMemoryDB.trainingPhases.values());
    res.json(phases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: 'In-Memory',
    profiles: inMemoryDB.profiles.size,
    workouts: inMemoryDB.workouts.size,
    nutrition: inMemoryDB.nutrition.size
  });
});

// Export the app
module.exports.handler = serverless(app);

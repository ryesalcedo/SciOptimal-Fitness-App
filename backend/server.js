const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://scioptimal-fitness.netlify.app',
  credentials: true
}));
app.use(express.json());

// MongoDB connection. Set MONGODB_URI in the environment. There is no default credential.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. The API will start, but database routes will fail until it is configured.');
} else {
  mongoose.connect(MONGODB_URI);
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    age: Number,
    height: Number, // in inches
    weight: Number, // in kg
    bodyFatPercentage: Number,
    goalWeight: Number,
    targetPhysique: String,
    equipment: [String],
    activityLevel: String,
    sleepSchedule: {
      wakeUpTime: String,
      bedTime: String,
      targetSleepHours: Number,
      sleepQuality: Number,
      sleepTracking: Boolean,
      sleepNotes: String
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Workout Schema
const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['workout', 'workoutDay'], required: true },
  exercises: [{
    name: String,
    muscle_group: [String],
    sets: Number,
    reps: String,
    weight: Number,
    rpe: Number,
    notes: String
  }],
  accessories: [{
    name: String,
    muscle_group: [String],
    sets: Number,
    reps: String,
    weight: Number,
    rpe: Number,
    notes: String
  }],
  duration: Number, // minutes
  notes: String,
  rpe: Number,
  createdAt: { type: Date, default: Date.now }
});

// Nutrition Schema
const nutritionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meal: { type: String, required: true },
  foods: [{
    name: String,
    kcal: Number,
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
    fiber_g: Number,
    sodium_mg: Number,
    potassium_mg: Number
  }],
  totalCalories: Number,
  macros: {
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
    fiber_g: Number,
    sodium_mg: Number,
    potassium_mg: Number
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Sleep Schema
const sleepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  sleepHours: { type: Number, required: true },
  sleepQuality: { type: Number, required: true, min: 1, max: 10 },
  stressLevel: { type: Number, required: true, min: 1, max: 10 },
  caffeineIntake: { type: Number, required: true }, // hours before bed
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Progress Schema
const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
  bodyFatPercentage: Number,
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    calves: Number
  },
  strengthLifts: {
    benchPress: Number,
    squat: Number,
    deadlift: Number,
    overheadPress: Number,
    rows: Number
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Training Phase Schema
const trainingPhaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: Number, // weeks
  targetWeight: Number,
  targetBodyFat: Number,
  focus: { type: String, enum: ['lean_recomp', 'muscle_gain', 'final_cut'] },
  trainingSplit: {
    days: [{
      dayNumber: Number,
      muscleGroups: [String],
      exercises: [{
        name: String,
        muscle_group: [String],
        equipment: [String],
        sets: Number,
        reps: String,
        rpe: Number
      }],
      accessories: [{
        name: String,
        muscle_group: [String],
        equipment: [String],
        sets: Number,
        reps: String,
        rpe: Number
      }]
    }],
    restDays: [Number]
  },
  nutritionPlan: {
    targetCalories: Number,
    macros: {
      protein_g: Number,
      carbs_g: Number,
      fat_g: Number,
      fiber_g: Number
    }
  },
  cardioPlan: {
    frequency: Number,
    duration: Number,
    intensity: String
  },
  progressionRules: [{
    type: String,
    condition: String,
    action: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const Nutrition = mongoose.model('Nutrition', nutritionSchema);
const Sleep = mongoose.model('Sleep', sleepSchema);
const Progress = mongoose.model('Progress', progressSchema);
const TrainingPhase = mongoose.model('TrainingPhase', trainingPhaseSchema);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not set' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not set' });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not set' });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        profile: req.body.profile,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Workout Routes
app.post('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const workout = new Workout({
      ...req.body,
      userId: req.user.userId
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Nutrition Routes
app.post('/api/nutrition', authenticateToken, async (req, res) => {
  try {
    const nutrition = new Nutrition({
      ...req.body,
      userId: req.user.userId
    });
    await nutrition.save();
    res.status(201).json(nutrition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/nutrition', authenticateToken, async (req, res) => {
  try {
    const nutrition = await Nutrition.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Sleep Routes
app.post('/api/sleep', authenticateToken, async (req, res) => {
  try {
    const sleep = new Sleep({
      ...req.body,
      userId: req.user.userId
    });
    await sleep.save();
    res.status(201).json(sleep);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/sleep', authenticateToken, async (req, res) => {
  try {
    const sleep = await Sleep.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(sleep);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Progress Routes
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = new Progress({
      ...req.body,
      userId: req.user.userId
    });
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Training Phase Routes
app.post('/api/training-phases', authenticateToken, async (req, res) => {
  try {
    const trainingPhase = new TrainingPhase({
      ...req.body,
      userId: req.user.userId
    });
    await trainingPhase.save();
    res.status(201).json(trainingPhase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/training-phases', authenticateToken, async (req, res) => {
  try {
    const trainingPhases = await TrainingPhase.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(trainingPhases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Routes - Get All Users Data (for monitoring Devin)
app.get('/api/admin/users', async (req, res) => {
  try {
    // In production, add proper admin authentication
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/user/:userId/data', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [workouts, nutrition, sleep, progress, trainingPhases] = await Promise.all([
      Workout.find({ userId }),
      Nutrition.find({ userId }),
      Sleep.find({ userId }),
      Progress.find({ userId }),
      TrainingPhase.find({ userId })
    ]);

    res.json({
      workouts,
      nutrition,
      sleep,
      progress,
      trainingPhases
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Badge
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  Psychology,
  Watch,
  Sync,
  Insights,
  Warning,
  CheckCircle,
  Schedule,
  Speed,
  MonitorHeart,
  Edit
} from '@mui/icons-material';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { NutritionCalculator } from '../services/nutritionCalculator';
import { isSameDay, toDate } from '../utils/units';
import WorkoutEditor from './WorkoutEditor';
import FoodLogger from './FoodLogger';
import WorkoutTracker from './WorkoutTracker';
import DailyCheckIn from './DailyCheckIn';

// Enhanced Dashboard with Apple Watch Integration and Smart AI
export default function EnhancedDashboard() {
  const { 
    userProfile, 
    workoutHistory, 
    nutritionLog, 
    progressHistory, 
    sleepLog,
    healthData,
    isHealthDataConnected,
    lastHealthSync,
    optimizationInsights,
    adaptivePlan,
    aiAnalysis,
    isOptimizing,
    todaysWorkout,
    syncHealthData,
    runAIOptimization,
    generateTodaysWorkout
  } = useAppStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showWorkoutEditor, setShowWorkoutEditor] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showFoodLogger, setShowFoodLogger] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [workoutAccepted, setWorkoutAccepted] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [showWorkoutTracker, setShowWorkoutTracker] = useState(false);

  const optimizedFor = useRef('');

  useEffect(() => {
    if (!userProfile) return;
    const key = [
      userProfile.id,
      userProfile.weight,
      userProfile.targetPhysique,
      workoutHistory.length,
      nutritionLog.length,
      sleepLog.length,
      progressHistory.length,
      healthData ? 'health' : 'none',
    ].join(':');
    if (optimizedFor.current === key) return;
    optimizedFor.current = key;
    runAIOptimization();
  }, [
    userProfile,
    workoutHistory.length,
    nutritionLog.length,
    sleepLog.length,
    progressHistory.length,
    healthData,
    runAIOptimization,
  ]);

  const handleSyncHealthData = async () => {
    setIsSyncing(true);
    await syncHealthData();
    setIsSyncing(false);
  };

  const handleAddWorkout = () => {
    setEditingWorkout(null);
    setShowWorkoutEditor(true);
  };

  const handleEditWorkout = (workout: any) => {
    setEditingWorkout(workout);
    setShowWorkoutEditor(true);
  };

  const handleAddFood = () => {
    setEditingFood(null);
    setShowFoodLogger(true);
  };

  const handleEditFood = (food: any) => {
    setEditingFood(food);
    setShowFoodLogger(true);
  };

  const handleAcceptWorkout = () => {
    setWorkoutAccepted(true);
    // You could also add the workout to workoutHistory here if desired
  };

  const handleChangeWorkout = async () => {
    setIsGeneratingWorkout(true);
    try {
      generateTodaysWorkout();
      setWorkoutAccepted(false);
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsGeneratingWorkout(false);
      }, 1000);
    } catch (error) {
      setIsGeneratingWorkout(false);
    }
  };

  const handleStartWorkout = () => {
    setShowWorkoutTracker(true);
  };

  const handleWorkoutComplete = (completedWorkout: any) => {
    setShowWorkoutTracker(false);
    setWorkoutAccepted(false); // Reset so they can generate a new workout
    // The workout is already added to history by the WorkoutTracker
  };

  const handleCancelWorkout = () => {
    setShowWorkoutTracker(false);
    // Don't reset workoutAccepted so they can try again
  };

  const todayWorkouts = workoutHistory.filter(w => isSameDay(w.date));

  const todayNutrition = nutritionLog.filter(n => isSameDay(n.date));
  const nutritionTargets = userProfile ? NutritionCalculator.calculateNutritionTargets(userProfile) : null;

  const totalCalories = todayNutrition.reduce((sum, n) => sum + n.calories, 0);
  const totalProtein = todayNutrition.reduce((sum, n) => sum + n.protein, 0);
  const totalCarbs = todayNutrition.reduce((sum, n) => sum + n.carbs, 0);
  const totalFat = todayNutrition.reduce((sum, n) => sum + n.fat, 0);

  // Health metrics from Apple Watch
  const todaySteps = healthData?.steps.find((s) => isSameDay(s.date))?.count || 0;

  const todayHeartRate = healthData?.heartRate.filter((h) => isSameDay(h.timestamp)) || [];
  const avgHeartRate = todayHeartRate.length > 0 
    ? todayHeartRate.reduce((sum: number, h: any) => sum + h.value, 0) / todayHeartRate.length 
    : 0;

  const restingHR = healthData?.restingHeartRate || 0;
  const vo2Max = healthData?.vo2Max || 0;

  // AI Optimization Score
  const optimizationScore = aiAnalysis?.overallScore || 0;
  const highPriorityInsights = optimizationInsights.filter((i: any) => i.priority === 'high');
  const riskFactors = aiAnalysis?.riskFactors || [];

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Apple Watch Integration Status */}
      <Grid item xs={12}>
        <Card className="fitness-card glass-effect" sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%)',
          border: '1px solid rgba(0, 122, 255, 0.2)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Watch sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ color: '#ffffff !important' }}>Apple Watch Integration</Typography>
                <Chip 
                  label={isHealthDataConnected ? 'Connected' : 'Disconnected'} 
                  color={isHealthDataConnected ? 'success' : 'error'}
                  size="small"
                  className={isHealthDataConnected ? "status-online" : "status-offline"}
                  sx={{ ml: 2 }}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={isSyncing ? <CircularProgress size={16} /> : <Sync />}
                onClick={handleSyncHealthData}
                disabled={isSyncing}
                size="small"
                className="gradient-button"
              >
                {isSyncing ? 'Syncing...' : 'Sync Data'}
              </Button>
            </Box>
            
            {isHealthDataConnected && lastHealthSync && (
              <Typography variant="body2" color="text.secondary">
                Last sync: {format(toDate(lastHealthSync), 'MMM d, h:mm a')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Real-time Health Metrics */}
      <Grid item xs={12} md={6}>
        <Card className="fitness-card metric-card slide-in">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MonitorHeart sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6" sx={{ color: '#ffffff !important' }}>Today's Health Metrics</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h4" color="primary.main">
                  {todaySteps.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">Steps</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="error.main">
                  {Math.round(avgHeartRate || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Avg HR (BPM)</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="info.main">
                  {restingHR}
                </Typography>
                <Typography variant="body2" color="text.secondary">Resting HR</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="success.main">
                  {isHealthDataConnected ? vo2Max : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">VO2 Max</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Optimization Score */}
      <Grid item xs={12} md={6}>
        <Card className="fitness-card metric-card slide-in">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Insights sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ color: '#ffffff !important' }}>AI Optimization Score</Typography>
              {isOptimizing && <CircularProgress size={20} sx={{ ml: 1 }} />}
            </Box>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h2" color={optimizationScore >= 80 ? 'success.main' : optimizationScore >= 60 ? 'warning.main' : 'error.main'}>
                {optimizationScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">Overall Score</Typography>
              <LinearProgress 
                variant="determinate" 
                value={optimizationScore} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={optimizationScore >= 80 ? 'success' : optimizationScore >= 60 ? 'warning' : 'error'}
              />
            </Box>

            {riskFactors.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {riskFactors.length} high-priority issue{riskFactors.length > 1 ? 's' : ''} detected
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Workout */}
      <Grid item xs={12} md={6}>
        <Card className="slide-in">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FitnessCenter sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Today's Workout</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddWorkout}
                sx={{
                  background: '#ffffff !important',
                  color: '#000000 !important',
                  '&:hover': {
                    background: '#cccccc !important'
                  }
                }}
              >
                Add Workout
              </Button>
            </Box>
            {todaysWorkout ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#ffffff !important' }}>
                    {todaysWorkout.name}
                  </Typography>
                  <Chip 
                    label={todaysWorkout.difficulty} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {todaysWorkout.focus} • {todaysWorkout.exercises.length} exercises • {todaysWorkout.duration} min
                </Typography>
                <Typography variant="body2" color="primary.main" gutterBottom>
                  {todaysWorkout.adaptationReason}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${todaysWorkout.totalCalories} cal`} 
                    color="secondary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={`${todaysWorkout.difficulty}`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={`${todaysWorkout.exercises.length} exercises`} 
                    color="info" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={`${todaysWorkout.duration} min`} 
                    color="warning" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff !important' }}>
                  Exercises:
                </Typography>
                <Box sx={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 1, p: 1 }}>
                  {todaysWorkout.exercises.slice(0, 4).map((exercise, index) => (
                    <Box key={exercise.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 1, 
                      p: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(45deg, #ff6b6b, #ffa500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1
                        }}>
                          <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                            {index + 1}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#ffffff !important', fontWeight: '500' }}>
                          {exercise.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${exercise.sets} sets`} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(76, 175, 80, 0.2) !important',
                            color: '#4caf50 !important',
                            fontWeight: 'bold'
                          }} 
                        />
                        <Chip 
                          label={`${exercise.reps} reps`} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(33, 150, 243, 0.2) !important',
                            color: '#2196f3 !important',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                  ))}
                  {todaysWorkout.exercises.length > 4 && (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Chip 
                        label={`+${todaysWorkout.exercises.length - 4} more exercises`} 
                        color="info" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                </Box>
                
                {/* Enhanced Accept/Change Workout Section */}
                <Box sx={{ mt: 3, p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {!workoutAccepted ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff !important', mb: 2, textAlign: 'center' }}>
                        Ready to start this workout?
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleAcceptWorkout}
                          startIcon={<CheckCircle />}
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%) !important',
                            color: '#ffffff !important',
                            px: 3,
                            py: 1,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #45a049 30%, #5cb85c 90%) !important',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Accept & Start
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleChangeWorkout}
                          disabled={isGeneratingWorkout}
                          startIcon={isGeneratingWorkout ? <CircularProgress size={16} /> : <Sync />}
                          sx={{
                            borderColor: '#ffffff !important',
                            color: '#ffffff !important',
                            px: 3,
                            py: 1,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#ff9800 !important',
                              color: '#ff9800 !important',
                              background: 'rgba(255, 152, 0, 0.1) !important',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)',
                            },
                            '&:disabled': {
                              borderColor: 'rgba(255, 255, 255, 0.3) !important',
                              color: 'rgba(255, 255, 255, 0.5) !important',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isGeneratingWorkout ? 'Generating...' : 'Generate New'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 24, mr: 1 }} />
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                          Workout Accepted! 🎯
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You're all set to crush this workout. Let's go! 💪
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          onClick={handleStartWorkout}
                          startIcon={<FitnessCenter />}
                          sx={{
                            background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%) !important',
                            color: '#ffffff !important',
                            px: 3,
                            py: 1,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #ff5252 30%, #ff7043 90%) !important',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Start Workout
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleChangeWorkout}
                          startIcon={<Sync />}
                          sx={{
                            borderColor: '#ff9800 !important',
                            color: '#ff9800 !important',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': {
                              background: 'rgba(255, 152, 0, 0.1) !important',
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Try Different
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : todayWorkouts.length > 0 ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#ffffff !important' }}>
                    {todayWorkouts[0].name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleEditWorkout(todayWorkouts[0])}
                    sx={{ color: '#ffffff !important' }}
                  >
                    <Edit />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {todayWorkouts[0].exercises.length} exercises • {todayWorkouts[0].duration} min
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label={`RPE: ${todayWorkouts[0].rpe}/10`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`Calories: ${Math.round(todayWorkouts[0].duration * 8)}`} 
                    color="secondary" 
                    size="small" 
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No workout scheduled for today
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddWorkout}
                  sx={{
                    borderColor: '#333333 !important',
                    color: '#ffffff !important',
                    '&:hover': {
                      borderColor: '#555555 !important'
                    }
                  }}
                >
                  Plan Your Workout
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Nutrition Progress */}
      <Grid item xs={12} md={6}>
        <Card className="slide-in">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Restaurant sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Nutrition Today</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddFood}
                sx={{
                  background: '#ffffff !important',
                  color: '#000000 !important',
                  '&:hover': {
                    background: '#cccccc !important'
                  }
                }}
              >
                Log Food
              </Button>
            </Box>
            <Typography variant="h4" color="primary.main">
              {totalCalories}
              {nutritionTargets ? ` / ${nutritionTargets.calories}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              calories consumed
            </Typography>
            {nutritionTargets && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (totalCalories / nutritionTargets.calories) * 100)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Protein {totalProtein.toFixed(0)}/{nutritionTargets.protein}g · 
                  Carbs {totalCarbs.toFixed(0)}/{nutritionTargets.carbs}g · 
                  Fat {totalFat.toFixed(0)}/{nutritionTargets.fat}g
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={`Protein: ${totalProtein.toFixed(0)}g`} size="small" />
              <Chip label={`Carbs: ${totalCarbs.toFixed(0)}g`} size="small" />
              <Chip label={`Fat: ${totalFat.toFixed(0)}g`} size="small" />
              <Chip label={`${todayNutrition.length} meals`} size="small" variant="outlined" />
            </Box>
            
            {/* Recent Food Entries */}
            {todayNutrition.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#ffffff !important', mb: 1 }}>
                  Recent Entries:
                </Typography>
                {todayNutrition.slice(-3).map((entry, index) => (
                  <Box key={entry.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    py: 0.5,
                    px: 1,
                    background: '#111111',
                    borderRadius: '4px',
                    mb: 0.5
                  }}>
                    <Typography variant="body2" sx={{ color: '#ffffff !important' }}>
                      {entry.food} • {entry.calories} cal
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEditFood(entry)}
                      sx={{ color: '#ffffff !important' }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                ))}
                {todayNutrition.length > 3 && (
                  <Typography variant="caption" sx={{ color: '#cccccc !important' }}>
                    +{todayNutrition.length - 3} more entries
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <DailyCheckIn />

      {/* AI Optimization Insights */}
      <Grid item xs={12}>
        <Card className="slide-in">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">AI Optimization Insights</Typography>
              <Badge badgeContent={highPriorityInsights.length} color="error" sx={{ ml: 1 }}>
                <Warning color="error" />
              </Badge>
            </Box>
            
            {optimizationInsights.length > 0 ? (
              <List dense>
                {optimizationInsights.slice(0, 5).map((insight: any, index: number) => (
                  <React.Fragment key={insight.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: insight.priority === 'high' ? 'error.main' : 
                                  insight.priority === 'medium' ? 'warning.main' : 'info.main'
                        }}>
                          {insight.priority === 'high' ? <Warning fontSize="small" /> :
                           insight.priority === 'medium' ? <Schedule fontSize="small" /> :
                           <CheckCircle fontSize="small" />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{insight.title}</Typography>
                            <Chip 
                              label={insight.priority} 
                              size="small" 
                              color={insight.priority === 'high' ? 'error' : 
                                    insight.priority === 'medium' ? 'warning' : 'info'}
                            />
                            <Chip 
                              label={`${insight.confidence}% confidence`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {insight.description}
                            </Typography>
                            <Typography variant="caption" color="primary.main">
                              💡 {insight.recommendation}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Expected Impact: {insight.expectedImpact || 'N/A'}% • 
                                Data Points: {insight.dataPoints ? insight.dataPoints.join(', ') : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Complete some workouts and nutrition entries to get AI optimization insights!
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Adaptive Plan Status */}
      {adaptivePlan && (
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%)',
            border: '1px solid rgba(156, 39, 176, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Adaptive Plan Status</Typography>
                <Chip 
                  label={`Phase: ${adaptivePlan.currentPhase}`} 
                  color="primary" 
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Typography variant="body1" gutterBottom>
                {adaptivePlan.currentPhase.replace('_', ' ').toUpperCase()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Next review: {format(new Date(adaptivePlan.nextReview), 'MMM d, h:mm a')}
              </Typography>
              
              {adaptivePlan.adjustments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Adjustments ({adaptivePlan.adjustments.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {adaptivePlan.adjustments.slice(-3).map((adjustment: any, index: number) => (
                      <Chip
                        key={adjustment.id}
                        label={`${adjustment.type}: ${adjustment.reason.substring(0, 30)}...`}
                        size="small"
                        color={adjustment.impact === 'positive' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Workout Editor Modal */}
      <WorkoutEditor
        open={showWorkoutEditor}
        onClose={() => {
          setShowWorkoutEditor(false);
          setEditingWorkout(null);
        }}
        workout={editingWorkout}
        isEditing={!!editingWorkout}
      />

      {/* Food Logger Modal */}
      <FoodLogger
        open={showFoodLogger}
        onClose={() => {
          setShowFoodLogger(false);
          setEditingFood(null);
        }}
        entry={editingFood}
        isEditing={!!editingFood}
      />

      {/* Workout Tracker Modal */}
      {todaysWorkout && showWorkoutTracker && (
        <WorkoutTracker
          workout={todaysWorkout}
          onComplete={handleWorkoutComplete}
          onClose={handleCancelWorkout}
        />
      )}
    </Grid>
  );
}

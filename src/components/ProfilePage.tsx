import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Alert
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  FitnessCenter,
  Restaurant,
  Psychology,
  Settings,
  TrendingUp,
  AccessTime,
  Height,
  MonitorWeight,
  LocalFireDepartment,
  Speed
} from '@mui/icons-material';
import { useAppStore, UserProfile } from '../store';
import { NutritionCalculator } from '../services/nutritionCalculator';
import { poundsToKilograms } from '../utils/units';

export default function ProfilePage() {
  const { userProfile, setUserProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(userProfile || {
    id: 'profile_1',
    name: 'User',
    age: 25,
    sex: 'male',
    height: 70,
    weight: 170,
    bodyFatPercentage: 15,
    goalWeight: 165,
    targetPhysique: 'Athletic',
    activityLevel: 'Moderately Active',
    equipment: [],
    createdAt: new Date()
  });

  useEffect(() => {
    if (userProfile) setEditProfile(userProfile);
  }, [userProfile]);

  const handleSave = () => {
    setUserProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(userProfile || editProfile);
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (!editProfile.height || !editProfile.weight) return '0';
    const heightInMeters = editProfile.height * 0.0254;
    const weightKg = poundsToKilograms(editProfile.weight);
    return (weightKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'warning' as const };
    if (bmi < 25) return { label: 'Normal', color: 'success' as const };
    if (bmi < 30) return { label: 'Overweight', color: 'warning' as const };
    return { label: 'Obese', color: 'error' as const };
  };

  const calculateBMR = () => {
    if (!editProfile.age || !editProfile.height || !editProfile.weight) return 0;
    return Math.round(NutritionCalculator.calculateBMR(
      poundsToKilograms(editProfile.weight),
      editProfile.height,
      editProfile.age,
      editProfile.sex || 'male'
    ));
  };

  const calculateTDEE = () => {
    return NutritionCalculator.calculateNutritionTargets(editProfile).calories;
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(parseFloat(bmi));
  const bmr = calculateBMR();
  const tdee = calculateTDEE();

  if (!userProfile) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please complete your profile setup first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card className="fitness-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                    <Person sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#ffffff !important', mb: 1 }}>
                      {userProfile.name || 'Your Profile'}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      {editProfile.targetPhysique} • {editProfile.activityLevel} Activity
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${editProfile.age} years old`} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={`${editProfile.height}" tall`} 
                        color="secondary" 
                        size="small" 
                      />
                      <Chip 
                        label={`${editProfile.weight} lbs`} 
                        color="info" 
                        size="small" 
                      />
                    </Box>
                  </Box>
                </Box>
                <Box>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%) !important',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%) !important',
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        color="success"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{ color: '#ffffff !important', borderColor: '#ffffff !important' }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Metrics */}
        <Grid item xs={12} md={6}>
          <Card className="fitness-card metric-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 3, display: 'flex', alignItems: 'center' }}>
                <MonitorWeight sx={{ mr: 1, color: 'primary.main' }} />
                Health Metrics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main">
                      {bmi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">BMI</Typography>
                    <Chip 
                      label={bmiCategory.label} 
                      color={bmiCategory.color} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="secondary.main">
                      {editProfile.bodyFatPercentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Body Fat</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Weight: {editProfile.weight} lbs
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Goal Weight: {editProfile.goalWeight || 'Not set'} lbs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Difference: {editProfile.goalWeight ? editProfile.goalWeight - editProfile.weight : 0} lbs
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Calorie Information */}
        <Grid item xs={12} md={6}>
          <Card className="fitness-card metric-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 3, display: 'flex', alignItems: 'center' }}>
                <LocalFireDepartment sx={{ mr: 1, color: 'warning.main' }} />
                Calorie Information
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="warning.main">
                  {tdee}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Daily calorie target
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on {editProfile.activityLevel} activity level
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  BMR: {bmr} calories/day
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activity Factor: {editProfile.activityLevel}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Goals & Preferences */}
        <Grid item xs={12} md={6}>
          <Card className="fitness-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 3, display: 'flex', alignItems: 'center' }}>
                <FitnessCenter sx={{ mr: 1, color: 'primary.main' }} />
                Goals & Preferences
              </Typography>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Target Physique: {editProfile.targetPhysique}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Activity Level: {editProfile.activityLevel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Goal Weight: {editProfile.goalWeight || 'Not set'} lbs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Equipment: {(editProfile.equipment && editProfile.equipment.length > 0) ? editProfile.equipment.join(', ') : 'Bodyweight'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Summary */}
        <Grid item xs={12} md={6}>
          <Card className="fitness-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 3, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                Progress Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current BMI: {bmi} ({bmiCategory.label})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Daily Calorie Needs: {tdee} calories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Weight Goal: {editProfile.goalWeight ? (editProfile.goalWeight - editProfile.weight > 0 ? '+' : '') + (editProfile.goalWeight - editProfile.weight) + ' lbs' : 'Not set'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form Dialog */}
        <Dialog open={isEditing} onClose={handleCancel} maxWidth="md" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={editProfile.age}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Sex"
                  value={editProfile.sex || 'male'}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, sex: e.target.value as UserProfile['sex'] }))}
                  SelectProps={{ native: true }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (inches)"
                  type="number"
                  value={editProfile.height}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (lbs)"
                  type="number"
                  value={editProfile.weight}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Body Fat %"
                  type="number"
                  value={editProfile.bodyFatPercentage}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, bodyFatPercentage: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Goal Weight (lbs)"
                  type="number"
                  value={editProfile.goalWeight}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, goalWeight: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Target Physique"
                  value={editProfile.targetPhysique}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, targetPhysique: e.target.value }))}
                  SelectProps={{ native: true }}
                >
                  <option value="Athletic">Athletic</option>
                  <option value="Muscular">Muscular</option>
                  <option value="Lean">Lean</option>
                  <option value="NFL Fullback">NFL Fullback</option>
                  <option value="Power Athlete">Power Athlete</option>
                  <option value="Functional Strength">Functional Strength</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Activity Level"
                  value={editProfile.activityLevel}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                  SelectProps={{ native: true }}
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
}

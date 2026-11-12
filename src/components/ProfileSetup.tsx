import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Height,
  MonitorWeight,
  FitnessCenter,
  Save
} from '@mui/icons-material';
import { useAppStore, UserProfile } from '../store';
import { goalCurationService, CuratedPlan } from '../services/goalCuration';

export default function ProfileSetup() {
  const { setUserProfile, user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    sex: 'male' as 'male' | 'female',
    height: '', // in inches
    weight: '', // in lbs
    bodyFatPercentage: '',
    goalWeight: '',
    targetPhysique: '',
    activityLevel: 'Moderately Active' as const,
    equipment: [] as string[]
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => {
      if (equipment === 'None') {
        return { ...prev, equipment: prev.equipment.includes('None') ? [] : ['None'] };
      }
      const withoutNone = prev.equipment.filter(item => item !== 'None');
      return {
        ...prev,
        equipment: withoutNone.includes(equipment)
          ? withoutNone.filter(item => item !== equipment)
          : [...withoutNone, equipment]
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const age = parseInt(formData.age, 10);
      const height = parseInt(formData.height, 10);
      const weight = parseInt(formData.weight, 10);
      const bodyFatPercentage = parseFloat(formData.bodyFatPercentage);
      if (age < 13 || age > 100) throw new Error('Age must be between 13 and 100');
      if (height < 48 || height > 96) throw new Error('Height must be between 48 and 96 inches');
      if (weight < 70 || weight > 500) throw new Error('Weight must be between 70 and 500 pounds');
      if (bodyFatPercentage < 3 || bodyFatPercentage > 60) throw new Error('Body fat must be between 3% and 60%');

      const profile: UserProfile = {
        id: user?.id || 'temp-id',
        name: formData.name.trim(),
        age,
        sex: formData.sex,
        height,
        weight,
        bodyFatPercentage,
        goalWeight: formData.goalWeight ? parseInt(formData.goalWeight, 10) : undefined,
        targetPhysique: formData.targetPhysique,
        activityLevel: formData.activityLevel,
        equipment: formData.equipment,
        createdAt: new Date()
      };

      // Generate curated plan based on goal
      const curatedPlan = await goalCurationService.curatePlan(profile);
      
      // Store the curated plan in localStorage for now (in a real app, this would go to a database)
      localStorage.setItem('curatedPlan', JSON.stringify(curatedPlan));
      
      setUserProfile(profile);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.age && formData.height && 
                     formData.weight && formData.bodyFatPercentage && 
                     formData.targetPhysique;

  const equipmentOptions = [
    'Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands',
    'Pull-up Bar', 'Bench', 'Squat Rack', 'Cardio Machine',
    'Yoga Mat', 'Medicine Ball', 'TRX', 'None'
  ];

  const physiqueOptions = [
    'Lean & Toned', 'Muscular', 'Athletic', 'Strength Focused',
    'Endurance Focused', 'Weight Loss', 'Weight Gain', 'Maintenance',
    'NFL Fullback', 'Power Athlete', 'Functional Strength'
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Card sx={{ 
        maxWidth: 600,
        width: '100%',
        background: '#000000 !important',
        border: '1px solid #333333 !important',
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Person sx={{ fontSize: 48, color: '#ffffff', mb: 2 }} />
            <Typography variant="h4" sx={{ color: '#ffffff !important', mb: 1 }}>
              Complete Your Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#ffffff !important' }}>
              Help us personalize your fitness journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, background: '#000000 !important', color: '#ffffff !important' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange('age')}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ color: '#ffffff !important' }}>Sex</InputLabel>
                  <Select
                    value={formData.sex}
                    label="Sex"
                    onChange={handleSelectChange('sex')}
                    sx={{
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Physical Stats */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2, mt: 2 }}>
                  Physical Stats
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (inches)"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange('height')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Height sx={{ mr: 1, color: '#ffffff' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (lbs)"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange('weight')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <MonitorWeight sx={{ mr: 1, color: '#ffffff' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Body Fat %"
                  type="number"
                  value={formData.bodyFatPercentage}
                  onChange={handleInputChange('bodyFatPercentage')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <FitnessCenter sx={{ mr: 1, color: '#ffffff' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              {/* Goals */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2, mt: 2 }}>
                  Goals & Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Goal Weight (lbs)"
                  type="number"
                  value={formData.goalWeight}
                  onChange={handleInputChange('goalWeight')}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ color: '#ffffff !important' }}>Target Physique</InputLabel>
                  <Select
                    value={formData.targetPhysique}
                    onChange={handleSelectChange('targetPhysique')}
                    required
                    sx={{
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    }}
                  >
                    {physiqueOptions.map(option => (
                      <MenuItem key={option} value={option} sx={{ color: '#000000 !important' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ color: '#ffffff !important' }}>Activity Level</InputLabel>
                  <Select
                    value={formData.activityLevel}
                    onChange={handleSelectChange('activityLevel')}
                    sx={{
                      color: '#ffffff !important',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333 !important'
                      }
                    }}
                  >
                    <MenuItem value="Sedentary" sx={{ color: '#000000 !important' }}>Sedentary</MenuItem>
                    <MenuItem value="Lightly Active" sx={{ color: '#000000 !important' }}>Lightly Active</MenuItem>
                    <MenuItem value="Moderately Active" sx={{ color: '#000000 !important' }}>Moderately Active</MenuItem>
                    <MenuItem value="Very Active" sx={{ color: '#000000 !important' }}>Very Active</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Equipment */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2, mt: 2 }}>
                  Available Equipment
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {equipmentOptions.map(equipment => (
                    <Chip
                      key={equipment}
                      label={equipment}
                      onClick={() => handleEquipmentToggle(equipment)}
                      color={formData.equipment.includes(equipment) ? 'primary' : 'default'}
                      sx={{
                        color: formData.equipment.includes(equipment) ? '#000000 !important' : '#ffffff !important',
                        background: formData.equipment.includes(equipment) ? '#ffffff !important' : '#333333 !important',
                        border: '1px solid #555555 !important'
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !isFormValid}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: '#ffffff !important',
                    color: '#000000 !important',
                    '&:hover': {
                      background: '#cccccc !important'
                    }
                  }}
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

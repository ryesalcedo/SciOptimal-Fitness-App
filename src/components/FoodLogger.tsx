import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Delete,
  Save,
  Restaurant,
  LocalFireDepartment
} from '@mui/icons-material';
import { useAppStore, NutritionEntry } from '../store';
import { format } from 'date-fns';

interface FoodLoggerProps {
  open: boolean;
  onClose: () => void;
  entry?: NutritionEntry | null;
  isEditing?: boolean;
}

export default function FoodLogger({ open, onClose, entry, isEditing = false }: FoodLoggerProps) {
  const { addNutritionEntry, deleteNutritionEntry, nutritionLog } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    food: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    servingSize: 1,
    unit: 'serving'
  });

  const [quickFoods] = useState([
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Salmon (100g)', calories: 208, protein: 25, carbs: 0, fat: 12 },
    { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10 },
    { name: 'Oatmeal (1 cup)', calories: 154, protein: 6, carbs: 27, fat: 3 },
    { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 20, carbs: 9, fat: 0 },
    { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0.4 },
    { name: 'Sweet Potato (1 medium)', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
    { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 0.6 }
  ]);

  useEffect(() => {
    if (entry && isEditing) {
      setFormData({
        food: entry.food,
        date: new Date(entry.date).toISOString().split('T')[0],
        time: new Date(entry.date).toTimeString().slice(0, 5),
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber || 0,
        sugar: entry.sugar || 0,
        servingSize: 1,
        unit: 'serving'
      });
    } else {
      // Reset form for new entry
      setFormData({
        food: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        servingSize: 1,
        unit: 'serving'
      });
    }
  }, [entry, isEditing, open]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleQuickFoodSelect = (food: any) => {
    setFormData(prev => ({
      ...prev,
      food: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.food.trim() || formData.calories <= 0) {
        setError('Please enter a valid food item with calories');
        setLoading(false);
        return;
      }

      const newEntry: NutritionEntry = {
        id: entry?.id || `nutrition_${Date.now()}`,
        date: new Date(`${formData.date}T${formData.time}`),
        food: formData.food,
        calories: formData.calories * formData.servingSize,
        protein: formData.protein * formData.servingSize,
        carbs: formData.carbs * formData.servingSize,
        fat: formData.fat * formData.servingSize,
        fiber: formData.fiber * formData.servingSize,
        sugar: formData.sugar * formData.servingSize
      };

      addNutritionEntry(newEntry);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save food entry');
      setLoading(false);
    }
  };

  const todayEntries = nutritionLog.filter(n => 
    new Date(n.date).toDateString() === new Date().toDateString()
  );

  const totalCalories = todayEntries.reduce((sum, n) => sum + n.calories, 0);
  const totalProtein = todayEntries.reduce((sum, n) => sum + n.protein, 0);
  const totalCarbs = todayEntries.reduce((sum, n) => sum + n.carbs, 0);
  const totalFat = todayEntries.reduce((sum, n) => sum + n.fat, 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: '#000000',
          border: '1px solid #333333',
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff !important', borderBottom: '1px solid #333333' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Restaurant sx={{ mr: 1 }} />
          {isEditing ? 'Edit Food Entry' : 'Log Food'}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, background: '#000000 !important' }}>
            {error}
          </Alert>
        )}

        {/* Today's Summary */}
        <Card sx={{ 
          background: '#111111',
          border: '1px solid #333333',
          mb: 3
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
              Today's Nutrition Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {totalCalories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calories
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {totalProtein.toFixed(0)}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Protein
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {totalCarbs.toFixed(0)}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Carbs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {totalFat.toFixed(0)}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fat
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Quick Food Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
                Quick Add Common Foods
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {quickFoods.map((food, index) => (
                  <Chip
                    key={index}
                    label={food.name}
                    onClick={() => handleQuickFoodSelect(food)}
                    sx={{
                      background: '#333333 !important',
                      color: '#ffffff !important',
                      '&:hover': {
                        background: '#555555 !important'
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Basic Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Food Item"
                value={formData.food}
                onChange={handleInputChange('food')}
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
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleInputChange('date')}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
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
                label="Time"
                type="time"
                value={formData.time}
                onChange={handleInputChange('time')}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
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

            {/* Serving Size */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serving Size"
                type="number"
                value={formData.servingSize}
                onChange={handleInputChange('servingSize')}
                required
                variant="outlined"
                inputProps={{ min: 0.1, step: 0.1 }}
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
                <InputLabel sx={{ color: '#ffffff !important' }}>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  sx={{
                    color: '#ffffff !important',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333 !important'
                    }
                  }}
                >
                  <MenuItem value="serving" sx={{ color: '#000000 !important' }}>Serving</MenuItem>
                  <MenuItem value="cup" sx={{ color: '#000000 !important' }}>Cup</MenuItem>
                  <MenuItem value="tbsp" sx={{ color: '#000000 !important' }}>Tablespoon</MenuItem>
                  <MenuItem value="tsp" sx={{ color: '#000000 !important' }}>Teaspoon</MenuItem>
                  <MenuItem value="oz" sx={{ color: '#000000 !important' }}>Ounce</MenuItem>
                  <MenuItem value="g" sx={{ color: '#000000 !important' }}>Gram</MenuItem>
                  <MenuItem value="piece" sx={{ color: '#000000 !important' }}>Piece</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Macronutrients */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
                Macronutrients (per serving)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={handleInputChange('calories')}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <LocalFireDepartment sx={{ mr: 1, color: '#ffffff' }} />
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

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Protein (g)"
                type="number"
                value={formData.protein}
                onChange={handleInputChange('protein')}
                variant="outlined"
                inputProps={{ min: 0, step: 0.1 }}
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

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Carbs (g)"
                type="number"
                value={formData.carbs}
                onChange={handleInputChange('carbs')}
                variant="outlined"
                inputProps={{ min: 0, step: 0.1 }}
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

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fat (g)"
                type="number"
                value={formData.fat}
                onChange={handleInputChange('fat')}
                variant="outlined"
                inputProps={{ min: 0, step: 0.1 }}
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

            {/* Optional Micronutrients */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
                Optional Micronutrients (per serving)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fiber (g)"
                type="number"
                value={formData.fiber}
                onChange={handleInputChange('fiber')}
                variant="outlined"
                inputProps={{ min: 0, step: 0.1 }}
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
              <TextField
                fullWidth
                label="Sugar (g)"
                type="number"
                value={formData.sugar}
                onChange={handleInputChange('sugar')}
                variant="outlined"
                inputProps={{ min: 0, step: 0.1 }}
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

            {/* Today's Entries */}
            {todayEntries.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff !important', mb: 2 }}>
                  Today's Food Entries
                </Typography>
                <List>
                  {todayEntries.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <ListItem sx={{ 
                        background: '#111111',
                        borderRadius: '8px',
                        mb: 1,
                        border: '1px solid #333333'
                      }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ color: '#ffffff !important' }}>
                                {entry.food}
                              </Typography>
                              <Chip 
                                label={`${entry.calories} cal`} 
                                size="small" 
                                sx={{ 
                                  background: '#333333 !important',
                                  color: '#ffffff !important'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: '#cccccc !important' }}>
                                {format(new Date(entry.date), 'h:mm a')} • 
                                P: {entry.protein.toFixed(1)}g • 
                                C: {entry.carbs.toFixed(1)}g • 
                                F: {entry.fat.toFixed(1)}g
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label={`Delete ${entry.food}`}
                            onClick={() => deleteNutritionEntry(entry.id)}
                            sx={{ color: '#ff4444 !important' }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < todayEntries.length - 1 && <Divider sx={{ borderColor: '#333333' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #333333' }}>
        <Button
          onClick={onClose}
          sx={{ color: '#ffffff !important' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.food.trim() || formData.calories <= 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{
            background: '#ffffff !important',
            color: '#000000 !important',
            '&:hover': {
              background: '#cccccc !important'
            }
          }}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Entry' : 'Log Food'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

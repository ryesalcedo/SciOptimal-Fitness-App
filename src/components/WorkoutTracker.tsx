import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  FitnessCenter,
  Timer
} from '@mui/icons-material';
import { useAppStore } from '../store';

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  rpe: number;
  notes: string;
}

interface TrackedExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  targetSets: number;
  targetReps: number;
}

interface WorkoutTrackerProps {
  workout: any;
  onComplete: (trackedWorkout: any) => void;
  onClose: () => void;
}

export default function WorkoutTracker({ workout, onComplete, onClose }: WorkoutTrackerProps) {
  const { addWorkoutSession } = useAppStore();
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>(
    workout.exercises.map((exercise: any) => ({
      id: exercise.id,
      name: exercise.name,
      sets: [],
      targetSets: exercise.sets,
      targetReps: parseInt(String(exercise.reps).split('-')[0], 10) || 8
    }))
  );
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setId: string } | null>(null);
  const [setForm, setSetForm] = useState({ reps: 0, weight: 0, rpe: 5, notes: '' });
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutRPE, setWorkoutRPE] = useState(5);
  const [isCompleting, setIsCompleting] = useState(false);

  const addSet = (exerciseId: string) => {
    const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      reps: trackedExercises.find(e => e.id === exerciseId)?.targetReps || 8,
      weight: 0,
      rpe: 5,
      notes: ''
    };

    setTrackedExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
  };

  const editSet = (exerciseId: string, setId: string) => {
    const exercise = trackedExercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    if (set) {
      setSetForm({
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe,
        notes: set.notes
      });
      setEditingSet({ exerciseId, setId });
    }
  };

  const saveSet = () => {
    if (!editingSet) return;

    setTrackedExercises(prev =>
      prev.map(exercise =>
        exercise.id === editingSet.exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === editingSet.setId
                  ? { ...set, ...setForm }
                  : set
              )
            }
          : exercise
      )
    );

    setEditingSet(null);
    setSetForm({ reps: 0, weight: 0, rpe: 5, notes: '' });
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setTrackedExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, sets: exercise.sets.filter(set => set.id !== setId) }
          : exercise
      )
    );
  };

  const completeWorkout = async () => {
    setIsCompleting(true);
    
    try {
      const completedWorkout = {
        id: `workout_${Date.now()}`,
        name: workout.name,
        date: new Date(),
        duration: workout.duration,
        exercises: trackedExercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            restTime: 60 // Default rest time
          })),
          notes: exercise.sets.map(set => set.notes).filter(n => n).join('; ')
        })),
        notes: workoutNotes,
        rpe: workoutRPE
      };

      // Add to workout history
      addWorkoutSession(completedWorkout);
      
      // Call the completion callback
      onComplete(completedWorkout);
      
    } catch (error) {
    } finally {
      setIsCompleting(false);
    }
  };

  const totalSets = trackedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const completedSets = trackedExercises.reduce((sum, exercise) => 
    sum + exercise.sets.filter(set => set.weight > 0).length, 0
  );

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessCenter sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">{workout.name}</Typography>
          </Box>
          <Chip 
            label={`${completedSets}/${totalSets} sets`} 
            color={completedSets === totalSets ? 'success' : 'primary'}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {workout.focus} • {workout.duration} minutes
          </Typography>
          <Typography variant="body2" color="primary.main" gutterBottom>
            {workout.adaptationReason}
          </Typography>
        </Box>

        {trackedExercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {exerciseIndex + 1}. {exercise.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addSet(exercise.id)}
                >
                  Add Set
                </Button>
              </Box>

              {exercise.sets.length > 0 ? (
                <List dense>
                  {exercise.sets.map((set, setIndex) => (
                    <React.Fragment key={set.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Set ${setIndex + 1}`}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip label={`${set.reps} reps`} size="small" />
                              <Chip label={`${set.weight} lbs`} size="small" />
                              <Chip label={`RPE ${set.rpe}`} size="small" />
                              {set.notes && (
                                <Chip label={set.notes} size="small" color="info" />
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => editSet(exercise.id, set.id)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteSet(exercise.id, set.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {setIndex < exercise.sets.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No sets added yet. Click "Add Set" to start tracking.
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Workout Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Workout Notes"
                multiline
                rows={3}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did the workout feel? Any observations..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Overall RPE (1-10)"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={workoutRPE}
                onChange={(e) => setWorkoutRPE(parseInt(e.target.value) || 5)}
                helperText="Rate of Perceived Exertion"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={completeWorkout}
          disabled={isCompleting || totalSets === 0}
          startIcon={isCompleting ? <Timer /> : <CheckCircle />}
        >
          {isCompleting ? 'Completing...' : 'Complete Workout'}
        </Button>
      </DialogActions>

      {/* Edit Set Dialog */}
      <Dialog open={!!editingSet} onClose={() => setEditingSet(null)}>
        <DialogTitle>Edit Set</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Reps"
                type="number"
                value={setForm.reps}
                onChange={(e) => setSetForm(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={setForm.weight}
                onChange={(e) => setSetForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="RPE (1-10)"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={setForm.rpe}
                onChange={(e) => setSetForm(prev => ({ ...prev, rpe: parseInt(e.target.value) || 5 }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={setForm.notes}
                onChange={(e) => setSetForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes about this set..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSet(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveSet}>Save</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

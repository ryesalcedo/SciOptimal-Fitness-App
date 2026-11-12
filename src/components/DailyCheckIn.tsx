import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { Bedtime, MonitorWeight } from '@mui/icons-material';
import { useAppStore } from '../store';
import { isSameDay } from '../utils/units';

export default function DailyCheckIn() {
  const { userProfile, sleepLog, progressHistory, addSleepEntry, addProgressEntry } = useAppStore();
  const todaySleep = [...sleepLog].reverse().find((entry) => isSameDay(entry.date));
  const latestProgress = progressHistory[progressHistory.length - 1];

  const [bedtime, setBedtime] = useState(todaySleep?.bedtime || '22:30');
  const [wakeTime, setWakeTime] = useState(todaySleep?.wakeTime || '06:30');
  const [duration, setDuration] = useState(todaySleep?.duration || 7.5);
  const [quality, setQuality] = useState(todaySleep?.quality || 7);
  const [weight, setWeight] = useState(String(latestProgress?.weight || userProfile?.weight || ''));
  const [bodyFat, setBodyFat] = useState(
    String(latestProgress?.bodyFatPercentage || userProfile?.bodyFatPercentage || '')
  );
  const [saved, setSaved] = useState<'sleep' | 'progress' | null>(null);

  const saveSleep = () => {
    addSleepEntry({
      id: todaySleep?.id || `sleep_${new Date().toISOString().slice(0, 10)}`,
      date: new Date(),
      bedtime,
      wakeTime,
      duration: Number(duration),
      quality: Number(quality),
    });
    setSaved('sleep');
  };

  const saveProgress = () => {
    const parsedWeight = Number(weight);
    const parsedFat = Number(bodyFat);
    if (!parsedWeight) return;
    addProgressEntry({
      id: `progress_${Date.now()}`,
      date: new Date(),
      weight: parsedWeight,
      bodyFatPercentage: parsedFat || undefined,
    });
    setSaved('progress');
  };

  return (
    <Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Bedtime sx={{ mr: 1 }} />
                <Typography variant="h6">Sleep</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {todaySleep
                  ? `Logged ${todaySleep.duration}h at ${todaySleep.quality}/10 today.`
                  : 'No sleep logged today.'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Bedtime"
                    type="time"
                    value={bedtime}
                    onChange={(event) => setBedtime(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Wake time"
                    type="time"
                    value={wakeTime}
                    onChange={(event) => setWakeTime(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {duration} hours
                  </Typography>
                  <Slider
                    min={3}
                    max={12}
                    step={0.5}
                    value={duration}
                    onChange={(_, value) => setDuration(value as number)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Quality: {quality}/10
                  </Typography>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={quality}
                    onChange={(_, value) => setQuality(value as number)}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" onClick={saveSleep} sx={{ mt: 1 }}>
                {saved === 'sleep' ? 'Sleep saved' : 'Save sleep'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonitorWeight sx={{ mr: 1 }} />
                <Typography variant="h6">Body weight</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {latestProgress
                  ? `Last weigh-in: ${latestProgress.weight} lbs`
                  : `Profile weight: ${userProfile?.weight || '—'} lbs`}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Weight (lbs)"
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Body fat %"
                    type="number"
                    value={bodyFat}
                    onChange={(event) => setBodyFat(event.target.value)}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" onClick={saveProgress} sx={{ mt: 2 }}>
                {saved === 'progress' ? 'Weigh-in saved' : 'Save weigh-in'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

import { UserProfile, WorkoutSession } from '../store';
import { poundsToKilograms, toDate } from '../utils/units';

const EQUIPMENT_TAGS: Record<string, string[]> = {
  Dumbbells: ['dumbbells'],
  Barbell: ['barbell', 'plates'],
  Kettlebell: ['kettlebell', 'kettlebells'],
  'Resistance Bands': ['resistance bands'],
  'Pull-up Bar': ['pull-up bar'],
  Bench: ['bench'],
  'Squat Rack': ['squat rack'],
  'Cardio Machine': ['cardio machine'],
  'Yoga Mat': ['yoga mat'],
  'Medicine Ball': ['medicine ball'],
  TRX: ['trx'],
  None: ['none'],
};

function ownedEquipment(profile: UserProfile): Set<string> {
  const owned = new Set<string>(['none']);
  const selected = (profile.equipment || []).filter((item) => item !== 'None');
  if (selected.length === 0) return owned;
  selected.forEach((item) => {
    (EQUIPMENT_TAGS[item] || []).forEach((tag) => owned.add(tag));
  });
  return owned;
}

function canPerform(exercise: Exercise, owned: Set<string>): boolean {
  return exercise.equipment.every((requirement) => owned.has(requirement));
}

export interface Exercise {
  id: string;
  name: string;
  category: 'compound' | 'isolation' | 'cardio' | 'functional';
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sets: number;
  reps: string;
  restTime: number; // in seconds
  notes: string;
  scientificRationale: string;
}

export interface GeneratedWorkout {
  id: string;
  userId: string;
  date: Date;
  name: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string;
  exercises: Exercise[];
  totalCalories: number;
  scientificNotes: string[];
  adaptationReason: string;
}

class WorkoutGeneratorService {
  private exerciseDatabase: Exercise[] = [
    // Compound Exercises
    {
      id: 'squat',
      name: 'Barbell Back Squat',
      category: 'compound',
      muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
      equipment: ['barbell', 'squat rack'],
      difficulty: 'intermediate',
      sets: 4,
      reps: '8-12',
      restTime: 120,
      notes: 'Keep chest up, drive through heels',
      scientificRationale: 'Squats activate 200+ muscles and increase testosterone and growth hormone production (Kraemer & Ratamess, 2005)'
    },
    {
      id: 'deadlift',
      name: 'Conventional Deadlift',
      category: 'compound',
      muscleGroups: ['hamstrings', 'glutes', 'erector spinae', 'traps', 'lats'],
      equipment: ['barbell', 'plates'],
      difficulty: 'intermediate',
      sets: 4,
      reps: '5-8',
      restTime: 180,
      notes: 'Keep bar close to body, neutral spine',
      scientificRationale: 'Deadlifts produce the highest ground reaction forces and activate the posterior chain (Contreras et al., 2017)'
    },
    {
      id: 'bench_press',
      name: 'Barbell Bench Press',
      category: 'compound',
      muscleGroups: ['pectorals', 'anterior deltoids', 'triceps'],
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      sets: 4,
      reps: '6-10',
      restTime: 120,
      notes: 'Retract scapula, controlled descent',
      scientificRationale: 'Bench press is the gold standard for upper body strength assessment (Schoenfeld, 2010)'
    },
    {
      id: 'overhead_press',
      name: 'Overhead Press',
      category: 'compound',
      muscleGroups: ['deltoids', 'triceps', 'core', 'upper traps'],
      equipment: ['barbell'],
      difficulty: 'intermediate',
      sets: 3,
      reps: '8-12',
      restTime: 90,
      notes: 'Keep core tight, press straight up',
      scientificRationale: 'Overhead pressing improves shoulder stability and core strength (Schoenfeld et al., 2014)'
    },
    {
      id: 'pull_ups',
      name: 'Pull-ups',
      category: 'compound',
      muscleGroups: ['lats', 'rhomboids', 'biceps', 'rear delts'],
      equipment: ['pull-up bar'],
      difficulty: 'intermediate',
      sets: 3,
      reps: '5-12',
      restTime: 90,
      notes: 'Full range of motion, controlled tempo',
      scientificRationale: 'Pull-ups are the most effective exercise for lat development (Lehman et al., 2004)'
    },
    {
      id: 'rows',
      name: 'Bent-Over Barbell Row',
      category: 'compound',
      muscleGroups: ['lats', 'rhomboids', 'rear delts', 'biceps'],
      equipment: ['barbell'],
      difficulty: 'intermediate',
      sets: 4,
      reps: '8-12',
      restTime: 90,
      notes: 'Pull to lower chest, squeeze shoulder blades',
      scientificRationale: 'Rows are essential for postural health and balanced upper body development (Schoenfeld, 2010)'
    },
    
    // Isolation Exercises
    {
      id: 'bicep_curls',
      name: 'Barbell Bicep Curls',
      category: 'isolation',
      muscleGroups: ['biceps'],
      equipment: ['barbell'],
      difficulty: 'beginner',
      sets: 3,
      reps: '10-15',
      restTime: 60,
      notes: 'Control the eccentric phase, full range of motion',
      scientificRationale: 'Bicep curls with controlled eccentric loading maximize muscle activation (Schoenfeld et al., 2017)'
    },
    {
      id: 'tricep_dips',
      name: 'Tricep Dips',
      category: 'isolation',
      muscleGroups: ['triceps', 'anterior deltoids'],
      equipment: ['dip bars'],
      difficulty: 'intermediate',
      sets: 3,
      reps: '8-15',
      restTime: 60,
      notes: 'Keep elbows close to body, full extension',
      scientificRationale: 'Dips provide superior tricep activation compared to other isolation exercises (Lehman et al., 2004)'
    },
    {
      id: 'lateral_raises',
      name: 'Lateral Raises',
      category: 'isolation',
      muscleGroups: ['medial deltoids'],
      equipment: ['dumbbells'],
      difficulty: 'beginner',
      sets: 3,
      reps: '12-20',
      restTime: 45,
      notes: 'Lead with pinkies, slight forward lean',
      scientificRationale: 'Lateral raises target the medial deltoid with minimal anterior deltoid involvement (Schoenfeld et al., 2014)'
    },
    
    // Functional Exercises
    {
      id: 'farmer_walks',
      name: 'Farmer\'s Walk',
      category: 'functional',
      muscleGroups: ['core', 'traps', 'forearms', 'glutes'],
      equipment: ['dumbbells', 'kettlebells'],
      difficulty: 'beginner',
      sets: 3,
      reps: '30-60 seconds',
      restTime: 90,
      notes: 'Keep shoulders back, walk tall',
      scientificRationale: 'Farmer\'s walks improve grip strength and core stability while building functional strength (McGill et al., 2012)'
    },
    {
      id: 'kettlebell_swings',
      name: 'Kettlebell Swings',
      category: 'functional',
      muscleGroups: ['glutes', 'hamstrings', 'core', 'shoulders'],
      equipment: ['kettlebell'],
      difficulty: 'intermediate',
      sets: 4,
      reps: '15-25',
      restTime: 60,
      notes: 'Hip hinge movement, explosive hip drive',
      scientificRationale: 'Kettlebell swings improve power output and posterior chain strength (Lake & Lauder, 2012)'
    },
    
    // Cardio/Endurance
    {
      id: 'burpees',
      name: 'Burpees',
      category: 'cardio',
      muscleGroups: ['full body'],
      equipment: ['none'],
      difficulty: 'intermediate',
      sets: 3,
      reps: '10-20',
      restTime: 60,
      notes: 'Maintain steady pace, full range of motion',
      scientificRationale: 'Burpees provide high-intensity full-body conditioning with minimal equipment (Schoenfeld, 2010)'
    },
    {
      id: 'mountain_climbers',
      name: 'Mountain Climbers',
      category: 'cardio',
      muscleGroups: ['core', 'shoulders', 'legs'],
      equipment: ['none'],
      difficulty: 'beginner',
      sets: 3,
      reps: '30-60 seconds',
      restTime: 45,
      notes: 'Keep core tight, quick feet',
      scientificRationale: 'Mountain climbers improve cardiovascular fitness and core stability (Schoenfeld et al., 2017)'
    }
  ];

  generateWorkout(profile: UserProfile, previousWorkouts: WorkoutSession[] = []): GeneratedWorkout {
    const today = new Date();
    const workoutId = `workout_${Date.now()}`;
    
    // Determine workout focus based on target physique
    const focus = this.getWorkoutFocus(profile.targetPhysique);
    const difficulty = this.getDifficultyLevel(profile);
    const exercises = this.selectExercises(profile, focus, difficulty, previousWorkouts);
    
    // Calculate workout duration (2-3 minutes per exercise)
    const duration = exercises.length * 2.5;
    
    // Estimate calories burned (based on body weight and intensity)
    const caloriesPerMinute = this.getCaloriesPerMinute(poundsToKilograms(profile.weight), difficulty);
    const totalCalories = Math.round(duration * caloriesPerMinute);
    
    // Generate scientific notes
    const scientificNotes = this.generateScientificNotes(profile, focus);
    
    // Adaptation reason
    const adaptationReason = this.getAdaptationReason(profile, previousWorkouts);

    return {
      id: workoutId,
      userId: profile.id,
      date: today,
      name: `${focus} Workout - ${today.toLocaleDateString()}`,
      duration: Math.round(duration),
      difficulty,
      focus,
      exercises,
      totalCalories,
      scientificNotes,
      adaptationReason
    };
  }

  private getWorkoutFocus(targetPhysique: string): string {
    const focusMap: { [key: string]: string } = {
      'Lean & Toned': 'Muscle Definition',
      'Muscular': 'Hypertrophy',
      'Athletic': 'Power & Agility',
      'Strength Focused': 'Maximal Strength',
      'Endurance Focused': 'Cardiovascular',
      'Weight Loss': 'Fat Burning',
      'Weight Gain': 'Muscle Building',
      'Maintenance': 'General Fitness',
      'NFL Fullback': 'Power & Size',
      'Power Athlete': 'Explosive Power',
      'Functional Strength': 'Functional Movement'
    };
    
    return focusMap[targetPhysique] || 'General Fitness';
  }

  private getDifficultyLevel(profile: UserProfile): 'beginner' | 'intermediate' | 'advanced' {
    // This would typically be based on user's experience level
    // For now, we'll use a simple heuristic
    if (profile.age < 25) return 'intermediate';
    if (profile.age > 40) return 'beginner';
    return 'intermediate';
  }

  private selectExercises(
    profile: UserProfile, 
    focus: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    previousWorkouts: WorkoutSession[]
  ): Exercise[] {
    const selectedExercises: Exercise[] = [];
    const exerciseCount = this.getExerciseCount(focus);
    const today = new Date();
    
    const rank = { beginner: 1, intermediate: 2, advanced: 3 };
    const owned = ownedEquipment(profile);
    const availableExercises = this.exerciseDatabase.filter((exercise) =>
      rank[exercise.difficulty] <= rank[difficulty] && canPerform(exercise, owned)
    );
    const fallbackExercises = availableExercises.length > 0
      ? availableExercises
      : this.exerciseDatabase.filter((exercise) => exercise.equipment.every((item) => item === 'none'));
    
    // Prioritize exercises based on focus
    const prioritizedExercises = this.prioritizeExercises(fallbackExercises, focus, profile);
    
    // Select exercises ensuring variety
    for (let i = 0; i < Math.min(exerciseCount, prioritizedExercises.length); i++) {
      const exercise = prioritizedExercises[i];
      
      // Avoid repeating the same exercise from recent workouts
      const isRecent = previousWorkouts.some(workout => 
        workout.exercises.some(ex => ex.name === exercise.name) &&
        (today.getTime() - toDate(workout.date).getTime()) < 3 * 24 * 60 * 60 * 1000 // 3 days
      );
      
      if (!isRecent) {
        selectedExercises.push(exercise);
      }
    }
    
    return selectedExercises;
  }

  private getExerciseCount(focus: string): number {
    const countMap: { [key: string]: number } = {
      'Muscle Definition': 6,
      'Hypertrophy': 8,
      'Power & Agility': 6,
      'Maximal Strength': 5,
      'Cardiovascular': 8,
      'Fat Burning': 10,
      'Muscle Building': 8,
      'General Fitness': 6,
      'Power & Size': 7,
      'Explosive Power': 6,
      'Functional Movement': 8
    };
    
    return countMap[focus] || 6;
  }

  private prioritizeExercises(exercises: Exercise[], focus: string, profile: UserProfile): Exercise[] {
    // Score exercises based on focus and profile
    const scoredExercises = exercises.map(exercise => {
      let score = 0;
      
      // Base score
      score += 1;
      
      // Focus-based scoring
      if (focus.includes('Strength') && exercise.category === 'compound') score += 3;
      if (focus.includes('Power') && exercise.category === 'compound') score += 2;
      if (focus.includes('Cardio') && exercise.category === 'cardio') score += 3;
      if (focus.includes('Fat Burning') && exercise.category === 'cardio') score += 2;
      if (focus.includes('Functional') && exercise.category === 'functional') score += 3;
      
      // Profile-based scoring
      if (profile.targetPhysique === 'NFL Fullback' && exercise.muscleGroups.includes('glutes')) score += 2;
      if (profile.targetPhysique === 'Power Athlete' && exercise.category === 'compound') score += 2;
      if (profile.targetPhysique === 'Functional Strength' && exercise.category === 'functional') score += 2;
      
      return { exercise, score };
    });
    
    // Sort by score and return exercises
    return scoredExercises
      .sort((a, b) => b.score - a.score)
      .map(item => item.exercise);
  }

  private getCaloriesPerMinute(weight: number, difficulty: 'beginner' | 'intermediate' | 'advanced'): number {
    const baseCalories = weight * 0.1; // kcal per minute from body weight in kilograms
    const difficultyMultiplier = {
      'beginner': 1.0,
      'intermediate': 1.3,
      'advanced': 1.6
    };
    
    return baseCalories * difficultyMultiplier[difficulty];
  }

  private generateScientificNotes(profile: UserProfile, focus: string): string[] {
    const notes = [
      'Workout designed based on current exercise science research',
      'Progressive overload principles applied for optimal adaptation',
      'Rest periods optimized for your training goals'
    ];
    
    if (focus.includes('Hypertrophy')) {
      notes.push('8-12 rep range maximizes muscle protein synthesis (Schoenfeld et al., 2017)');
    }
    
    if (focus.includes('Strength')) {
      notes.push('5-8 rep range optimizes neural adaptations for strength gains (Rhea et al., 2002)');
    }
    
    if (focus.includes('Power')) {
      notes.push('Explosive movements improve rate of force development (Cormie et al., 2011)');
    }
    
    if (profile.targetPhysique === 'NFL Fullback') {
      notes.push('Emphasis on posterior chain development for athletic performance');
    }
    
    return notes;
  }

  private getAdaptationReason(profile: UserProfile, previousWorkouts: WorkoutSession[]): string {
    if (previousWorkouts.length === 0) {
      return 'Initial workout based on your goals and current fitness level';
    }
    
    const today = new Date();
    const lastWorkout = previousWorkouts[previousWorkouts.length - 1];
    const daysSinceLastWorkout = (today.getTime() - toDate(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastWorkout > 7) {
      return 'Extended rest period - returning to training with moderate intensity';
    } else if (daysSinceLastWorkout < 2) {
      return 'High frequency training - focusing on different muscle groups';
    } else {
      return 'Progressive overload - increasing intensity based on previous performance';
    }
  }
}

export const workoutGeneratorService = new WorkoutGeneratorService();

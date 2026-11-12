import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { workoutGeneratorService, GeneratedWorkout } from './services/workoutGenerator';
import { aiOptimizationService } from './services/aiOptimization';
import { NutritionCalculator } from './services/nutritionCalculator';
import { HealthData as WatchHealthData } from './types/health';
import {
  authenticateAccount,
  emptySavedUserData,
  loadUserData,
  localDataForEmail,
  registerAccount,
  SavedUserData,
  saveUserData,
} from './services/accounts';
import {
  detectHomeServer,
  homeLogin,
  homeLogout,
  homeRegister,
  homeSave,
  homeToken,
  setHomeToken,
} from './services/homeServer';
import { dayKey, isSameDay, toDate } from './utils/units';
import { buildNutritionPlan, GoalType, NutritionPlan } from './services/coaching';
import { PhysiqueRead } from './services/physique';
import {
  applyProgression,
  buildProgram,
  deloadWeek,
  Experience,
  ProgramExercise,
  SetPerformance,
  TrainingProgram,
} from './services/program';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  height: number;
  weight: number;
  bodyFatPercentage: number;
  goalWeight?: number;
  targetPhysique: string;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  equipment: string[];
  createdAt: Date;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  name: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  rpe?: number;
}

export interface Exercise {
  name: string;
  muscle?: string;
  secondary?: string[];
  sets: ExerciseSet[];
  notes?: string;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number;
  restTime?: number;
}

export interface NutritionEntry {
  id: string;
  date: Date;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  meal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings?: number;
}

export interface CoachingSettings {
  type: GoalType;
  rateLbPerWeek: number;
  targetWeight: number;
  trainingDays: number;
  sessionMinutes: number;
  experience: Experience;
  physique?: string;
  physiqueSummary?: string;
  emphasis?: string[];
}

export interface LockedPlan extends NutritionPlan {
  mode: 'coached' | 'manual';
  updatedAt: string;
}

export interface CustomFood {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SessionSet extends SetPerformance {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  secondary: string[];
}

export interface ActiveSession {
  dayId: string;
  dayName: string;
  startedAt: string;
  sets: SessionSet[];
}

export interface ProgressEntry {
  id: string;
  date: Date;
  weight: number;
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[];
  notes?: string;
}

export interface SleepEntry {
  id: string;
  date: Date;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
}

export interface HealthData {
  steps: Array<{ date: string; count: number }>;
  heartRate: Array<{ timestamp: string; value: number }>;
  restingHeartRate: number;
  activeCalories: Array<{ date: string; calories: number }>;
  sleep: Array<{ date: string; duration: number; quality: number }>;
  vo2Max: number;
}

export interface OptimizationInsight {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'progression' | 'timing';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: number;
  effort: number;
  timeframe: string;
  evidence: string[];
  recommendation?: string;
  expectedImpact?: number;
  confidence?: number;
  dataPoints?: string[];
}

export interface AdaptivePlan {
  id: string;
  userId: string;
  currentPhase: string;
  adjustments: PlanAdjustment[];
  lastUpdated: Date;
  nextReview: Date;
}

export interface PlanAdjustment {
  id: string;
  type: 'recovery' | 'workout' | 'nutrition' | 'progression' | 'timing';
  reason: string;
  change: string;
  impact: number;
  date: Date;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  overallScore: number;
  riskFactors: string[];
  opportunities: string[];
  recommendations: string[];
  generatedAt: Date;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface OnboardingInput {
  name: string;
  sex: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  goalType: GoalType;
  rateLbPerWeek: number;
  targetWeight: number;
  trainingDays: number;
  sessionMinutes: number;
  experience: Experience;
  equipment: string[];
  physique?: string;
  emphasis?: string[];
  physiqueSummary?: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: AppUser | null;
  authLoading: boolean;
  authError: string | null;
  showAuthModal: boolean;
  userProfile: UserProfile | null;
  workoutHistory: WorkoutSession[];
  nutritionLog: NutritionEntry[];
  progressHistory: ProgressEntry[];
  sleepLog: SleepEntry[];
  healthData: HealthData | null;
  isHealthDataConnected: boolean;
  lastHealthSync: Date | null;
  optimizationInsights: OptimizationInsight[];
  adaptivePlan: AdaptivePlan | null;
  aiAnalysis: AIAnalysis | null;
  isOptimizing: boolean;
  todaysWorkout: GeneratedWorkout | null;
  goal: CoachingSettings | null;
  lockedPlan: LockedPlan | null;
  program: TrainingProgram | null;
  customFoods: CustomFood[];
  activeSession: ActiveSession | null;
  checkIns: LockedPlan[];
  currentTab: number;
  completeOnboarding: (input: OnboardingInput) => void;
  applyPhysique: (read: PhysiqueRead) => void;
  setLockedPlan: (plan: LockedPlan) => void;
  rebuildProgram: () => void;
  startSession: (dayId: string) => void;
  logSessionSet: (set: Omit<SessionSet, 'id'>) => void;
  finishSession: () => void;
  swapExercise: (dayId: string, exerciseId: string) => void;
  addCustomFood: (food: CustomFood) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, invite?: string) => Promise<void>;
  logout: () => void;
  setShowAuthModal: (show: boolean) => void;
  setUserProfile: (profile: UserProfile) => void;
  setCurrentTab: (tab: number) => void;
  loadUserData: () => Promise<void>;
  addWorkout: (workout: WorkoutSession) => void;
  addWorkoutSession: (workout: WorkoutSession) => void;
  deleteWorkout: (id: string) => void;
  addNutritionEntry: (entry: NutritionEntry) => void;
  deleteNutritionEntry: (id: string) => void;
  addProgressEntry: (entry: ProgressEntry) => void;
  addSleepEntry: (entry: SleepEntry) => void;
  setHealthData: (data: HealthData) => void;
  setHealthDataConnected: (connected: boolean) => void;
  syncHealthData: () => Promise<void>;
  addOptimizationInsight: (insight: OptimizationInsight) => void;
  setAdaptivePlan: (plan: AdaptivePlan) => void;
  setAIAnalysis: (analysis: AIAnalysis) => void;
  setIsOptimizing: (optimizing: boolean) => void;
  runAIOptimization: () => Promise<void>;
  generateTodaysWorkout: () => void;
}

const blankTrainingData = {
  userProfile: null as UserProfile | null,
  workoutHistory: [] as WorkoutSession[],
  nutritionLog: [] as NutritionEntry[],
  progressHistory: [] as ProgressEntry[],
  sleepLog: [] as SleepEntry[],
  healthData: null as HealthData | null,
  isHealthDataConnected: false,
  lastHealthSync: null as Date | null,
  optimizationInsights: [] as OptimizationInsight[],
  adaptivePlan: null as AdaptivePlan | null,
  aiAnalysis: null as AIAnalysis | null,
  todaysWorkout: null as GeneratedWorkout | null,
  goal: null as CoachingSettings | null,
  lockedPlan: null as LockedPlan | null,
  program: null as TrainingProgram | null,
  customFoods: [] as CustomFood[],
  activeSession: null as ActiveSession | null,
  checkIns: [] as LockedPlan[],
};

function reviveList<T extends { date?: Date | string }>(items: T[] | undefined): T[] {
  return (items || []).map((item) => ({
    ...item,
    date: item.date ? toDate(item.date) : item.date,
  }));
}

function savedFromHome(email: string, data: Partial<SavedUserData>): SavedUserData {
  const merged = { ...emptySavedUserData(), ...data };
  if (merged.userProfile || merged.goal) return merged;
  const local = localDataForEmail(email);
  if (!local) return merged;
  homeSave(local).catch(() => undefined);
  return local;
}

function reviveTrainingData(data: SavedUserData) {
  const profile = data.userProfile as UserProfile | null;
  const plan = data.adaptivePlan as AdaptivePlan | null;
  const analysis = data.aiAnalysis as AIAnalysis | null;
  const workout = data.todaysWorkout as GeneratedWorkout | null;

  return {
    userProfile: profile
      ? {
          ...profile,
          sex: profile.sex || 'male',
          equipment: profile.equipment || [],
          createdAt: toDate(profile.createdAt),
        }
      : null,
    workoutHistory: reviveList(data.workoutHistory as WorkoutSession[]),
    nutritionLog: reviveList(data.nutritionLog as NutritionEntry[]),
    progressHistory: reviveList(data.progressHistory as ProgressEntry[]),
    sleepLog: reviveList(data.sleepLog as SleepEntry[]),
    healthData: (data.healthData as HealthData | null) || null,
    isHealthDataConnected: Boolean(data.isHealthDataConnected),
    lastHealthSync: data.lastHealthSync ? toDate(data.lastHealthSync) : null,
    optimizationInsights: (data.optimizationInsights as OptimizationInsight[]) || [],
    adaptivePlan: plan
      ? {
          ...plan,
          lastUpdated: toDate(plan.lastUpdated),
          nextReview: toDate(plan.nextReview),
          adjustments: (plan.adjustments || []).map((adjustment) => ({
            ...adjustment,
            date: toDate(adjustment.date),
          })),
        }
      : null,
    aiAnalysis: analysis
      ? { ...analysis, generatedAt: toDate(analysis.generatedAt) }
      : null,
    todaysWorkout: workout ? { ...workout, date: toDate(workout.date) } : null,
    goal: (data.goal as CoachingSettings | null) || null,
    lockedPlan: (data.lockedPlan as LockedPlan | null) || null,
    program: (data.program as TrainingProgram | null) || null,
    customFoods: (data.customFoods as CustomFood[]) || [],
    activeSession: (data.activeSession as ActiveSession | null) || null,
    checkIns: (data.checkIns as LockedPlan[]) || [],
  };
}

function snapshotFromState(state: AppState): SavedUserData {
  return {
    userProfile: state.userProfile,
    workoutHistory: state.workoutHistory,
    nutritionLog: state.nutritionLog,
    progressHistory: state.progressHistory,
    sleepLog: state.sleepLog,
    healthData: state.healthData,
    isHealthDataConnected: state.isHealthDataConnected,
    lastHealthSync: state.lastHealthSync ? toDate(state.lastHealthSync).toISOString() : null,
    optimizationInsights: state.optimizationInsights,
    adaptivePlan: state.adaptivePlan,
    aiAnalysis: state.aiAnalysis,
    todaysWorkout: state.todaysWorkout,
    goal: state.goal,
    lockedPlan: state.lockedPlan,
    program: state.program,
    customFoods: state.customFoods,
    activeSession: state.activeSession,
    checkIns: state.checkIns,
  };
}

function rotateExercise(exercise: ProgramExercise, exerciseId: string): ProgramExercise {
  if (exercise.id !== exerciseId || exercise.options.length < 2) return exercise;
  const index = exercise.options.findIndex((option) => option.name === exercise.name);
  const next = exercise.options[(index + 1) % exercise.options.length];
  return {
    ...exercise,
    name: next.name,
    equipment: next.equipment,
    lastWeight: undefined,
    lastReps: undefined,
    lastRir: undefined,
    nextWeight: undefined,
    nextReps: undefined,
  };
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [...items, item];
  const next = items.slice();
  next[index] = item;
  return next;
}

function phaseFor(profile: UserProfile): string {
  const goal = profile.targetPhysique.toLowerCase();
  if (goal.includes('loss') || goal.includes('lean')) return 'cut';
  if (goal.includes('gain') || goal.includes('muscular') || goal.includes('fullback')) return 'bulk';
  return 'recomp';
}

function buildPlan(profile: UserProfile, existing: AdaptivePlan | null): AdaptivePlan {
  return {
    id: existing?.id || `plan_${Date.now()}`,
    userId: profile.id,
    currentPhase: phaseFor(profile),
    adjustments: existing?.adjustments || [],
    lastUpdated: new Date(),
    nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

function asWatchHealth(data: HealthData | null): WatchHealthData {
  return {
    heartRate: (data?.heartRate || []).map((item) => ({
      timestamp: toDate(item.timestamp),
      value: item.value,
      source: 'Manual',
      context: 'active',
    })),
    steps: (data?.steps || []).map((item) => ({
      date: toDate(item.date),
      count: item.count,
      distance: 0,
      floors: 0,
      activeMinutes: 0,
    })),
    sleep: (data?.sleep || []).map((item) => ({
      date: toDate(item.date),
      bedtime: toDate(item.date),
      wakeTime: toDate(item.date),
      duration: item.duration,
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      awake: 0,
      efficiency: item.quality * 10,
    })),
    workouts: [],
    heartRateVariability: [],
    activeEnergy: (data?.activeCalories || []).map((item) => ({
      date: toDate(item.date),
      active: item.calories,
      resting: 0,
      total: item.calories,
    })),
    restingHeartRate: data?.restingHeartRate || 0,
    vo2Max: data?.vo2Max || 0,
    lastSync: new Date(),
  };
}

function onboardingInsights(profile: UserProfile): OptimizationInsight[] {
  let targets;
  try {
    targets = NutritionCalculator.calculateNutritionTargets(profile);
  } catch {
    targets = null;
  }

  const insights: OptimizationInsight[] = [
    {
      id: `onboard_workout_${profile.id}`,
      type: 'workout',
      priority: 'medium',
      title: 'Train with today\'s plan',
      description: `Your ${profile.targetPhysique.toLowerCase()} goal is set. Accept today's workout and log the sets you complete.`,
      impact: 8,
      effort: 6,
      timeframe: 'today',
      evidence: [`Goal: ${profile.targetPhysique}`, `Activity: ${profile.activityLevel}`],
      recommendation: 'Log at least one workout this week so the plan can adapt to your recovery.',
      expectedImpact: 75,
      confidence: 80,
      dataPoints: [profile.targetPhysique, profile.activityLevel],
    },
  ];

  if (targets) {
    insights.unshift({
      id: `onboard_nutrition_${profile.id}`,
      type: 'nutrition',
      priority: 'high',
      title: 'Hit your daily targets',
      description: `Aim for about ${targets.calories} kcal and ${targets.protein}g of protein today.`,
      impact: 8,
      effort: 5,
      timeframe: 'today',
      evidence: [`${targets.calories} kcal`, `${targets.protein}g protein`],
      recommendation: targets.rationale[0] || 'Log each meal so the daily total stays visible.',
      expectedImpact: 80,
      confidence: 85,
      dataPoints: [`${targets.calories} kcal`, `${targets.protein}g protein`, `${targets.carbs}g carbs`, `${targets.fat}g fat`],
    });
  }

  return insights;
}

function gettingStartedScore(state: Pick<AppState, 'workoutHistory' | 'nutritionLog' | 'sleepLog' | 'progressHistory' | 'isHealthDataConnected'>): number {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  let score = 58;
  if (state.workoutHistory.some((workout) => toDate(workout.date).getTime() >= weekAgo)) score += 12;
  if (state.nutritionLog.some((entry) => isSameDay(entry.date, now))) score += 12;
  if (state.sleepLog.length > 0) score += 8;
  if (state.progressHistory.length > 0) score += 6;
  if (state.isHealthDataConnected) score += 4;
  return Math.min(score, 100);
}

function dailyValue(seed: number, minimum: number, span: number): number {
  const fraction = Math.abs(Math.sin(seed));
  return Math.round(minimum + fraction * span);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      authLoading: false,
      authError: null,
      showAuthModal: false,
      currentTab: 0,
      isOptimizing: false,
      ...blankTrainingData,

      login: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          if (await detectHomeServer()) {
            const session = await homeLogin(email, password);
            setHomeToken(session.token);
            const saved = reviveTrainingData(savedFromHome(email, session.data));
            set({
              isAuthenticated: true,
              user: session.user,
              authLoading: false,
              showAuthModal: false,
              authError: null,
              ...saved,
            });
            return;
          }
          const account = await authenticateAccount(email, password);
          const saved = reviveTrainingData(loadUserData(account.id));
          set({
            isAuthenticated: true,
            user: { id: account.id, name: account.name, email: account.email },
            authLoading: false,
            showAuthModal: false,
            authError: null,
            ...saved,
          });
        } catch (error: any) {
          set({
            authError: error.message || 'Login failed',
            authLoading: false,
          });
        }
      },

      register: async (name, email, password, invite = '') => {
        set({ authLoading: true, authError: null });
        try {
          if (await detectHomeServer()) {
            const session = await homeRegister(name, email, password, invite);
            setHomeToken(session.token);
            const saved = reviveTrainingData(savedFromHome(email, session.data));
            set({
              isAuthenticated: true,
              user: session.user,
              authLoading: false,
              showAuthModal: false,
              authError: null,
              currentTab: 0,
              ...saved,
            });
            return;
          }
          const account = await registerAccount(name, email, password);
          set({
            isAuthenticated: true,
            user: { id: account.id, name: account.name, email: account.email },
            authLoading: false,
            showAuthModal: false,
            authError: null,
            currentTab: 0,
            ...blankTrainingData,
          });
        } catch (error: any) {
          set({
            authError: error.message || 'Registration failed',
            authLoading: false,
          });
        }
      },

      logout: () => {
        const state = get();
        if (state.user?.id) {
          const snapshot = snapshotFromState(state);
          saveUserData(state.user.id, snapshot);
          if (homeToken()) homeSave(snapshot).catch(() => undefined);
        }
        homeLogout();
        set({
          isAuthenticated: false,
          user: null,
          authError: null,
          showAuthModal: false,
          currentTab: 0,
          isOptimizing: false,
          ...blankTrainingData,
        });
      },

      setShowAuthModal: (show) => set({ showAuthModal: show, authError: show ? null : get().authError }),
      setUserProfile: (profile) => {
        const state = get();
        const complete: UserProfile = {
          ...profile,
          sex: profile.sex || 'male',
          equipment: profile.equipment || [],
          createdAt: profile.createdAt ? toDate(profile.createdAt) : new Date(),
        };
        const adaptivePlan = buildPlan(complete, state.adaptivePlan);
        const todaysWorkout = workoutGeneratorService.generateWorkout(complete, state.workoutHistory);
        set({ userProfile: complete, adaptivePlan, todaysWorkout });
      },
      setCurrentTab: (tab) => set({ currentTab: tab }),
      loadUserData: async () => {
        const { user } = get();
        if (!user) return;
        set(reviveTrainingData(loadUserData(user.id)));
      },

      addWorkout: (workout) => set((state) => ({
        workoutHistory: upsertById(state.workoutHistory, workout),
      })),
      addWorkoutSession: (workout) => set((state) => ({
        workoutHistory: upsertById(state.workoutHistory, workout),
      })),
      deleteWorkout: (id) => set((state) => ({
        workoutHistory: state.workoutHistory.filter((workout) => workout.id !== id),
      })),
      addNutritionEntry: (entry) => set((state) => ({
        nutritionLog: upsertById(state.nutritionLog, entry),
      })),
      deleteNutritionEntry: (id) => set((state) => ({
        nutritionLog: state.nutritionLog.filter((entry) => entry.id !== id),
      })),
      addProgressEntry: (entry) => set((state) => ({
        progressHistory: upsertById(state.progressHistory, entry),
        userProfile: state.userProfile
          ? {
              ...state.userProfile,
              weight: entry.weight,
              bodyFatPercentage: entry.bodyFatPercentage ?? state.userProfile.bodyFatPercentage,
            }
          : state.userProfile,
      })),
      addSleepEntry: (entry) => set((state) => ({
        sleepLog: upsertById(state.sleepLog, entry),
      })),

      setHealthData: (data) => set({ healthData: data }),
      setHealthDataConnected: (connected) => set({ isHealthDataConnected: connected }),
      syncHealthData: async () => {
        const profile = get().userProfile;
        const today = new Date();
        const dayKey = today.getFullYear() * 1000 + today.getMonth() * 40 + today.getDate();
        const activityBase = {
          Sedentary: 4200,
          'Lightly Active': 6800,
          'Moderately Active': 8600,
          'Very Active': 11200,
        }[profile?.activityLevel || 'Moderately Active'];
        const steps = dailyValue(dayKey, activityBase, 1600);
        const restingHeartRate = dailyValue(dayKey + 3, 56, 12);
        const activeCalories = dailyValue(dayKey + 7, 280, 320);
        const sleepHours = Math.round(dailyValue(dayKey + 11, 65, 18)) / 10;
        const sleepQuality = dailyValue(dayKey + 13, 6, 3);
        const vo2Max = dailyValue(dayKey + 17, profile?.activityLevel === 'Very Active' ? 44 : 38, 8);
        const date = today.toISOString().split('T')[0];

        const healthData: HealthData = {
          steps: [{ date, count: steps }],
          heartRate: [{ timestamp: today.toISOString(), value: restingHeartRate + 12 }],
          restingHeartRate,
          activeCalories: [{ date, calories: activeCalories }],
          sleep: [{ date, duration: sleepHours, quality: sleepQuality }],
          vo2Max,
        };

        set({
          healthData,
          isHealthDataConnected: true,
          lastHealthSync: today,
        });
      },

      addOptimizationInsight: (insight) => set((state) => ({
        optimizationInsights: [...state.optimizationInsights, insight],
      })),
      setAdaptivePlan: (plan) => set({ adaptivePlan: plan }),
      setAIAnalysis: (analysis) => set({ aiAnalysis: analysis }),
      setIsOptimizing: (optimizing) => set({ isOptimizing: optimizing }),
      runAIOptimization: async () => {
        const state = get();
        if (!state.userProfile || state.isOptimizing) return;
        set({ isOptimizing: true });
        try {
          const analysis = await aiOptimizationService.analyzeAndOptimize(
            state.userProfile,
            state.workoutHistory,
            state.nutritionLog,
            state.progressHistory,
            state.sleepLog,
            asWatchHealth(state.healthData)
          );

          const mapped = analysis.insights.map((insight) => ({
            id: insight.id,
            type: insight.type,
            priority: insight.priority,
            title: insight.title,
            description: insight.description,
            impact: insight.expectedImpact,
            effort: insight.actionRequired ? 6 : 3,
            timeframe: 'this week',
            evidence: insight.dataPoints,
            recommendation: insight.recommendation,
            expectedImpact: insight.expectedImpact,
            confidence: insight.confidence,
            dataPoints: insight.dataPoints,
          }));

          const insights = mapped.length > 0 ? mapped : onboardingInsights(state.userProfile);
          const overallScore = mapped.length > 0
            ? analysis.overallScore
            : gettingStartedScore(state);

          set({
            isOptimizing: false,
            optimizationInsights: insights,
            aiAnalysis: {
              id: analysis.id,
              userId: state.userProfile.id,
              overallScore,
              riskFactors: analysis.riskFactors,
              opportunities: analysis.opportunities.length > 0
                ? analysis.opportunities
                : ['Log workouts, meals, and sleep to unlock tighter recommendations'],
              recommendations: analysis.recommendations.length > 0
                ? analysis.recommendations
                : insights.map((insight) => insight.recommendation || insight.title),
              generatedAt: new Date(),
            },
          });
        } catch {
          set({ isOptimizing: false });
        }
      },

      completeOnboarding: (input) => {
        const user = get().user;
        const profile: UserProfile = {
          id: user?.id || `profile_${Date.now()}`,
          name: input.name.trim(),
          age: input.age,
          sex: input.sex,
          height: input.height,
          weight: input.weight,
          bodyFatPercentage: 18,
          goalWeight: input.targetWeight,
          targetPhysique: input.goalType === 'lose' ? 'Weight Loss' : input.goalType === 'gain' ? 'Weight Gain' : 'Maintenance',
          activityLevel: input.trainingDays >= 5 ? 'Very Active' : input.trainingDays >= 3 ? 'Moderately Active' : 'Lightly Active',
          equipment: input.equipment,
          createdAt: new Date(),
        };
        const goal: CoachingSettings = {
          type: input.goalType,
          rateLbPerWeek: input.goalType === 'maintain' ? 0 : input.rateLbPerWeek,
          targetWeight: input.targetWeight,
          trainingDays: input.trainingDays,
          sessionMinutes: input.sessionMinutes,
          experience: input.experience,
          physique: input.physique,
          physiqueSummary: input.physiqueSummary,
          emphasis: input.emphasis,
        };
        const program = buildProgram({
          goal: goal.type,
          days: goal.trainingDays,
          sessionMinutes: goal.sessionMinutes,
          experience: goal.experience,
          equipment: profile.equipment,
          age: profile.age,
          emphasis: input.emphasis,
        });
        const plan = buildNutritionPlan({
          profile,
          goal,
          trainingDays: goal.trainingDays,
          intake: [],
          weighIns: [{ date: dayKey(), weight: profile.weight }],
        });
        const lockedPlan: LockedPlan = { ...plan, mode: 'coached', updatedAt: new Date().toISOString() };
        set({
          userProfile: profile,
          goal,
          program,
          lockedPlan,
          checkIns: [lockedPlan],
          activeSession: null,
          progressHistory: [...get().progressHistory, {
            id: `progress_${Date.now()}`,
            date: new Date(),
            weight: profile.weight,
          }],
        });
      },

      setLockedPlan: (plan) => set((state) => ({
        lockedPlan: plan,
        checkIns: [...state.checkIns, plan],
      })),

      applyPhysique: (read) => {
        const { userProfile, goal, lockedPlan, nutritionLog, progressHistory } = get();
        if (!userProfile || !goal || !read.understood) return;
        const nextGoal: CoachingSettings = {
          ...goal,
          type: read.goal,
          rateLbPerWeek: read.rateLbPerWeek,
          targetWeight: read.targetWeight,
          physique: read.text,
          physiqueSummary: read.summary,
          emphasis: read.emphasis,
          sessionMinutes: read.goal === 'gain' ? Math.max(goal.sessionMinutes, 75) : goal.sessionMinutes,
        };
        const intake = Object.entries(nutritionLog.reduce<Record<string, number>>((days, entry) => {
          const key = dayKey(entry.date);
          days[key] = (days[key] || 0) + entry.calories;
          return days;
        }, {})).map(([date, calories]) => ({ date, calories }));
        const plan = buildNutritionPlan({
          profile: userProfile,
          goal: nextGoal,
          trainingDays: nextGoal.trainingDays,
          intake,
          weighIns: progressHistory.map((entry) => ({ date: dayKey(entry.date), weight: entry.weight })),
          previousCalories: lockedPlan?.calories,
          previousSource: lockedPlan?.source,
        });
        const nextPlan: LockedPlan = { ...plan, mode: 'coached', updatedAt: new Date().toISOString() };
        set({
          goal: nextGoal,
          userProfile: { ...userProfile, goalWeight: read.targetWeight },
          program: buildProgram({
            goal: nextGoal.type,
            days: nextGoal.trainingDays,
            sessionMinutes: nextGoal.sessionMinutes,
            experience: nextGoal.experience,
            equipment: userProfile.equipment,
            age: userProfile.age,
            emphasis: read.emphasis,
          }),
          lockedPlan: nextPlan,
          checkIns: [...get().checkIns, nextPlan],
          activeSession: null,
        });
      },

      rebuildProgram: () => {
        const { userProfile, goal } = get();
        if (!userProfile || !goal) return;
        set({
          program: buildProgram({
            goal: goal.type,
            days: goal.trainingDays,
            sessionMinutes: goal.sessionMinutes,
            experience: goal.experience,
            equipment: userProfile.equipment,
            age: userProfile.age,
            emphasis: goal.emphasis,
          }),
          activeSession: null,
        });
      },

      startSession: (dayId) => {
        const day = get().program?.days.find((item) => item.id === dayId);
        if (!day) return;
        set({
          activeSession: {
            dayId: day.id,
            dayName: day.name,
            startedAt: new Date().toISOString(),
            sets: [],
          },
        });
      },

      logSessionSet: (entry) => set((state) => {
        if (!state.activeSession) return state;
        return {
          activeSession: {
            ...state.activeSession,
            sets: [...state.activeSession.sets, { ...entry, id: `set_${Date.now()}` }],
          },
        };
      }),

      finishSession: () => {
        const { activeSession, program, workoutHistory } = get();
        if (!activeSession || !program) return;
        const grouped = new Map<string, SessionSet[]>();
        activeSession.sets.forEach((entry) => {
          grouped.set(entry.exerciseId, [...(grouped.get(entry.exerciseId) || []), entry]);
        });
        const day = program.days.find((item) => item.id === activeSession.dayId);
        const exercises: Exercise[] = Array.from(grouped.entries()).map(([exerciseId, sets]) => {
          const planned = day?.exercises.find((exercise) => exercise.id === exerciseId);
          return {
            name: planned?.name || sets[0].name,
            muscle: planned?.muscle || sets[0].muscle,
            secondary: planned?.secondary || sets[0].secondary,
            sets: sets.map((entry) => ({
              reps: entry.reps,
              weight: entry.weight,
              rpe: Math.max(1, 10 - entry.rir),
            })),
          };
        });
        const started = new Date(activeSession.startedAt).getTime();
        const deload = deloadWeek(program.startedAt);
        const days = program.days.map((item) => {
          if (item.id !== activeSession.dayId) return item;
          return {
            ...item,
            exercises: item.exercises.map((exercise) => {
              const sets = grouped.get(exercise.id);
              return sets?.length ? applyProgression(exercise, sets, { deload }) : exercise;
            }),
          };
        });
        set({
          program: { ...program, days },
          workoutHistory: [...workoutHistory, {
            id: `workout_${Date.now()}`,
            date: new Date(),
            name: activeSession.dayName,
            duration: Math.max(1, Math.round((Date.now() - started) / 60000)),
            exercises,
          }],
          activeSession: null,
        });
      },

      swapExercise: (dayId, exerciseId) => set((state) => {
        if (!state.program) return state;
        return {
          program: {
            ...state.program,
            days: state.program.days.map((day) => {
              if (day.id !== dayId) return day;
              return {
                ...day,
                exercises: day.exercises.map((exercise) => rotateExercise(exercise, exerciseId)),
              };
            }),
          },
        };
      }),

      addCustomFood: (food) => set((state) => ({
        customFoods: [...state.customFoods, food],
      })),

      generateTodaysWorkout: () => {
        const state = get();
        if (!state.userProfile) return;
        set({
          todaysWorkout: workoutGeneratorService.generateWorkout(
            state.userProfile,
            state.workoutHistory
          ),
        });
      },
    }),
    {
      name: 'scioptimal-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        userProfile: state.userProfile,
        currentTab: state.currentTab,
        workoutHistory: state.workoutHistory,
        nutritionLog: state.nutritionLog,
        progressHistory: state.progressHistory,
        sleepLog: state.sleepLog,
        healthData: state.healthData,
        isHealthDataConnected: state.isHealthDataConnected,
        lastHealthSync: state.lastHealthSync,
        optimizationInsights: state.optimizationInsights,
        adaptivePlan: state.adaptivePlan,
        aiAnalysis: state.aiAnalysis,
        todaysWorkout: state.todaysWorkout,
        goal: state.goal,
        lockedPlan: state.lockedPlan,
        program: state.program,
        customFoods: state.customFoods,
        activeSession: state.activeSession,
        checkIns: state.checkIns,
      }),
      merge: (persisted, current) => {
        const saved = (persisted || {}) as SavedUserData & {
          isAuthenticated?: boolean;
          user?: AppUser | null;
          currentTab?: number;
        };
        return {
          ...current,
          ...saved,
          ...reviveTrainingData({ ...emptySavedUserData(), ...saved }),
          isAuthenticated: Boolean(saved.isAuthenticated),
          user: saved.user || null,
          currentTab: saved.currentTab || 0,
          authLoading: false,
          authError: null,
          showAuthModal: false,
          isOptimizing: false,
        };
      },
    }
  )
);

let homeSaveTimer: ReturnType<typeof setTimeout> | undefined;
useAppStore.subscribe((state) => {
  if (state.isAuthenticated && state.user?.id) {
    const snapshot = snapshotFromState(state);
    saveUserData(state.user.id, snapshot);
    if (!homeToken()) return;
    if (homeSaveTimer) clearTimeout(homeSaveTimer);
    homeSaveTimer = setTimeout(() => {
      homeSave(snapshot).catch(() => undefined);
    }, 400);
  }
});

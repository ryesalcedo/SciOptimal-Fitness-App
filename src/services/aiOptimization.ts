// Advanced AI Optimization Service
import { 
  OptimizationInsight, 
  AdaptivePlan, 
  PerformanceMetrics, 
  PlanAdjustment,
  AIAnalysis,
  HealthData
} from '../types/health';
import { WorkoutSession, NutritionEntry, ProgressEntry, SleepEntry, UserProfile } from '../store';

class AIOptimizationService {
  private analysisHistory: AIAnalysis[] = [];
  private currentPlan: AdaptivePlan | null = null;

  // Main AI analysis function
  async analyzeAndOptimize(
    userProfile: UserProfile,
    workoutHistory: WorkoutSession[],
    nutritionLog: NutritionEntry[],
    progressHistory: ProgressEntry[],
    sleepLog: SleepEntry[],
    healthData: HealthData
  ): Promise<AIAnalysis> {
    const analysis: AIAnalysis = {
      id: `analysis_${Date.now()}`,
      timestamp: new Date(),
      dataSource: 'Combined',
      insights: [],
      recommendations: [],
      riskFactors: [],
      opportunities: [],
      overallScore: 0,
      nextAnalysis: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Analyze different aspects
    const workoutInsights = this.analyzeWorkoutPerformance(workoutHistory, healthData);
    const nutritionInsights = this.analyzeNutritionPatterns(nutritionLog, userProfile);
    const recoveryInsights = this.analyzeRecoveryMetrics(sleepLog, healthData);
    const progressionInsights = this.analyzeProgressionTrends(progressHistory, workoutHistory);
    const timingInsights = this.analyzeOptimalTiming(healthData, workoutHistory);

    // Combine all insights
    analysis.insights = [
      ...workoutInsights,
      ...nutritionInsights,
      ...recoveryInsights,
      ...progressionInsights,
      ...timingInsights
    ];

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis.insights);
    
    // Identify risk factors
    analysis.riskFactors = this.identifyRiskFactors(analysis.insights);
    
    // Find opportunities
    analysis.opportunities = this.identifyOpportunities(analysis.insights);
    
    // Calculate overall score
    analysis.overallScore = this.calculateOverallScore(analysis.insights);

    // Update adaptive plan
    this.updateAdaptivePlan(analysis);

    this.analysisHistory.push(analysis);
    return analysis;
  }

  private analyzeWorkoutPerformance(workouts: WorkoutSession[], healthData: HealthData): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];
    
    if (workouts.length < 3) return insights;

    const recentWorkouts = workouts.slice(-10);
    const avgRPE = recentWorkouts.reduce((sum, w) => sum + (w.rpe || 0), 0) / recentWorkouts.length;
    const avgDuration = recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length;
    
    // Intensity analysis
    if (avgRPE < 7) {
      insights.push({
        id: `workout_intensity_${Date.now()}`,
        type: 'workout',
        priority: 'high',
        title: 'Increase Training Intensity',
        description: `Average RPE is ${avgRPE.toFixed(1)}, below optimal range of 7-9`,
        recommendation: 'Progressive overload: increase weight by 2.5-5% or add 1-2 reps per set',
        expectedImpact: 85,
        confidence: 90,
        dataPoints: [`RPE: ${avgRPE.toFixed(1)}`, `Duration: ${avgDuration.toFixed(0)}min`],
        actionRequired: true,
        timestamp: new Date()
      });
    }

    // Volume analysis
    const weeklyVolume = this.calculateWeeklyVolume(recentWorkouts);
    const targetVolume = this.calculateTargetVolume(workouts[0]?.exercises.length || 0);
    
    if (weeklyVolume < targetVolume * 0.8) {
      insights.push({
        id: `workout_volume_${Date.now()}`,
        type: 'workout',
        priority: 'medium',
        title: 'Increase Training Volume',
        description: `Current weekly volume is ${weeklyVolume} sets, below target of ${targetVolume}`,
        recommendation: 'Add 1-2 sets per exercise or include additional exercises',
        expectedImpact: 70,
        confidence: 85,
        dataPoints: [`Volume: ${weeklyVolume} sets`, `Target: ${targetVolume} sets`],
        actionRequired: true,
        timestamp: new Date()
      });
    }

    // Recovery analysis using HRV
    if (healthData.heartRateVariability.length > 0) {
      const hrvTrend = this.calculateHRVTrend(healthData.heartRateVariability);
      if (hrvTrend < -10) {
        insights.push({
          id: `recovery_hrv_${Date.now()}`,
          type: 'recovery',
          priority: 'high',
          title: 'Poor Recovery Detected',
          description: `HRV trend shows ${hrvTrend.toFixed(1)}% decline, indicating insufficient recovery`,
          recommendation: 'Reduce training intensity by 20% or add extra rest day',
          expectedImpact: 90,
          confidence: 95,
          dataPoints: [`HRV Trend: ${hrvTrend.toFixed(1)}%`, `Recent RPE: ${avgRPE.toFixed(1)}`],
          actionRequired: true,
          timestamp: new Date()
        });
      }
    }

    return insights;
  }

  private analyzeNutritionPatterns(nutrition: NutritionEntry[], profile: UserProfile): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];
    
    if (nutrition.length < 7) return insights;

    const recentNutrition = nutrition.slice(-14); // Last 2 weeks
    const avgProtein = recentNutrition.reduce((sum, n) => sum + n.protein, 0) / recentNutrition.length;
    const avgCalories = recentNutrition.reduce((sum, n) => sum + n.calories, 0) / recentNutrition.length;
    
    // Protein analysis
    const targetProtein = profile.weight * 0.8; // 0.8g per lb
    if (avgProtein < targetProtein * 0.9) {
      insights.push({
        id: `nutrition_protein_${Date.now()}`,
        type: 'nutrition',
        priority: 'high',
        title: 'Optimize Protein Intake',
        description: `Average protein: ${avgProtein.toFixed(1)}g vs target: ${targetProtein.toFixed(1)}g`,
        recommendation: 'Increase protein by 20-30g daily through lean meats, eggs, or supplements',
        expectedImpact: 80,
        confidence: 95,
        dataPoints: [`Protein: ${avgProtein.toFixed(1)}g`, `Target: ${targetProtein.toFixed(1)}g`],
        actionRequired: true,
        timestamp: new Date()
      });
    }

    // Meal timing analysis
    const mealTimes = this.analyzeMealTiming(recentNutrition);
    if (mealTimes.gaps > 6) {
      insights.push({
        id: `nutrition_timing_${Date.now()}`,
        type: 'nutrition',
        priority: 'medium',
        title: 'Optimize Meal Timing',
        description: `Average gap between meals: ${mealTimes.gaps.toFixed(1)} hours`,
        recommendation: 'Eat every 3-4 hours to maintain stable blood sugar and protein synthesis',
        expectedImpact: 60,
        confidence: 80,
        dataPoints: [`Meal gaps: ${mealTimes.gaps.toFixed(1)}h`, `Meals/day: ${mealTimes.frequency}`],
        actionRequired: false,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeRecoveryMetrics(sleep: SleepEntry[], healthData: HealthData): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];
    
    if (sleep.length < 7) return insights;

    const recentSleep = sleep.slice(-7);
    const avgDuration = recentSleep.reduce((sum, s) => sum + s.duration, 0) / recentSleep.length;
    const avgQuality = recentSleep.reduce((sum, s) => sum + s.quality, 0) / recentSleep.length;
    
    // Sleep duration analysis
    if (avgDuration < 7) {
      insights.push({
        id: `recovery_sleep_duration_${Date.now()}`,
        type: 'recovery',
        priority: 'high',
        title: 'Increase Sleep Duration',
        description: `Average sleep: ${avgDuration.toFixed(1)}h, below optimal 7-9h`,
        recommendation: 'Aim for 7-9 hours nightly. Consider earlier bedtime or better sleep hygiene',
        expectedImpact: 85,
        confidence: 90,
        dataPoints: [`Duration: ${avgDuration.toFixed(1)}h`, `Quality: ${avgQuality.toFixed(1)}/10`],
        actionRequired: true,
        timestamp: new Date()
      });
    }

    // Sleep quality analysis
    if (avgQuality < 7) {
      insights.push({
        id: `recovery_sleep_quality_${Date.now()}`,
        type: 'recovery',
        priority: 'medium',
        title: 'Improve Sleep Quality',
        description: `Sleep quality: ${avgQuality.toFixed(1)}/10, below optimal 8+`,
        recommendation: 'Optimize sleep environment: cooler room, no screens 1h before bed, consistent schedule',
        expectedImpact: 70,
        confidence: 85,
        dataPoints: [`Quality: ${avgQuality.toFixed(1)}/10`, `Duration: ${avgDuration.toFixed(1)}h`],
        actionRequired: false,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeProgressionTrends(progress: ProgressEntry[], workouts: WorkoutSession[]): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];
    
    if (progress.length < 4 || workouts.length < 10) return insights;

    // Weight progression analysis
    const recentProgress = progress.slice(-4);
    const weightChange = recentProgress[recentProgress.length - 1].weight - recentProgress[0].weight;
    const weeks = (new Date(recentProgress[recentProgress.length - 1].date).getTime() - new Date(recentProgress[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000);
    if (!Number.isFinite(weeks) || weeks <= 0) return insights;
    const weeklyWeightChange = weightChange / weeks;

    if (Math.abs(weeklyWeightChange) > 1.5) {
      insights.push({
        id: `progression_weight_${Date.now()}`,
        type: 'progression',
        priority: 'high',
        title: weeklyWeightChange > 0 ? 'Rapid Weight Gain' : 'Rapid Weight Loss',
        description: `Weight changing ${Math.abs(weeklyWeightChange).toFixed(2)} lbs/week`,
        recommendation: weeklyWeightChange > 0 
          ? 'Slow down weight gain to 0.5-1 lb/week to minimize fat gain'
          : 'Slow down weight loss to 0.5-1 lb/week to preserve muscle mass',
        expectedImpact: 90,
        confidence: 95,
        dataPoints: [`Change: ${weeklyWeightChange.toFixed(2)} lbs/week`, `Period: ${weeks.toFixed(1)} weeks`],
        actionRequired: true,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeOptimalTiming(healthData: HealthData, workouts: WorkoutSession[]): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];
    
    // Analyze workout timing based on circadian rhythms
    const workoutTimes = workouts.map(w => new Date(w.date).getHours());
    const avgWorkoutTime = workoutTimes.reduce((sum, time) => sum + time, 0) / workoutTimes.length;
    
    // Optimal workout time is typically 2-6 PM
    if (avgWorkoutTime < 14 || avgWorkoutTime > 18) {
      insights.push({
        id: `timing_workout_${Date.now()}`,
        type: 'timing',
        priority: 'low',
        title: 'Optimize Workout Timing',
        description: `Average workout time: ${Math.round(avgWorkoutTime)}:00, optimal is 2-6 PM`,
        recommendation: 'Consider working out between 2-6 PM when strength and performance peak',
        expectedImpact: 40,
        confidence: 70,
        dataPoints: [`Avg time: ${Math.round(avgWorkoutTime)}:00`, `Optimal: 2-6 PM`],
        actionRequired: false,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private generateRecommendations(insights: OptimizationInsight[]): string[] {
    const recommendations: string[] = [];
    
    // Group insights by priority
    const highPriority = insights.filter(i => i.priority === 'high');
    const mediumPriority = insights.filter(i => i.priority === 'medium');
    
    if (highPriority.length > 0) {
      recommendations.push(`Focus on ${highPriority.length} high-priority optimizations for maximum impact`);
    }
    
    if (mediumPriority.length > 0) {
      recommendations.push(`Consider ${mediumPriority.length} medium-priority improvements for continued progress`);
    }
    
    return recommendations;
  }

  private identifyRiskFactors(insights: OptimizationInsight[]): string[] {
    const riskFactors: string[] = [];
    
    insights.forEach(insight => {
      if (insight.priority === 'high' && insight.actionRequired) {
        riskFactors.push(insight.title);
      }
    });
    
    return riskFactors;
  }

  private identifyOpportunities(insights: OptimizationInsight[]): string[] {
    const opportunities: string[] = [];
    
    insights.forEach(insight => {
      if (insight.expectedImpact > 70) {
        opportunities.push(insight.title);
      }
    });
    
    return opportunities;
  }

  private calculateOverallScore(insights: OptimizationInsight[]): number {
    if (insights.length === 0) return 100;
    
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
    const highPriorityCount = insights.filter(i => i.priority === 'high').length;
    const riskScore = Math.max(0, 100 - (highPriorityCount * 15));
    
    return Math.round((avgConfidence + riskScore) / 2);
  }

  private updateAdaptivePlan(analysis: AIAnalysis): void {
    if (!this.currentPlan) {
      this.currentPlan = this.createInitialPlan();
    }

    // Update plan based on analysis
    const adjustments = this.generatePlanAdjustments(analysis);
    this.currentPlan.adjustments.push(...adjustments);
    this.currentPlan.performanceMetrics = this.calculatePerformanceMetrics(analysis);
    this.currentPlan.nextOptimization = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
  }

  private createInitialPlan(): AdaptivePlan {
    return {
      id: `plan_${Date.now()}`,
      name: 'SciOptimal Adaptive Plan',
      phase: 'recomp',
      duration: 12,
      currentWeek: 1,
      adjustments: [],
      performanceMetrics: {
        strength: {
          progressionRate: 0,
          volumeProgression: 0,
          intensityProgression: 0,
          plateauRisk: 0,
          recommendedDeload: false
        },
        endurance: {
          vo2Max: 0,
          lactateThreshold: 0,
          aerobicBase: 0,
          anaerobicCapacity: 0,
          efficiency: 0
        },
        recovery: {
          hrvTrend: 0,
          sleepQuality: 0,
          stressLevel: 0,
          readinessScore: 0,
          fatigueLevel: 0
        },
        nutrition: {
          adherence: 0,
          macroBalance: 0,
          timing: 0,
          hydration: 0,
          micronutrientScore: 0
        },
        consistency: {
          workoutFrequency: 0,
          nutritionConsistency: 0,
          sleepConsistency: 0,
          adherenceScore: 0,
          streakDays: 0
        }
      },
      nextOptimization: new Date()
    };
  }

  private generatePlanAdjustments(analysis: AIAnalysis): PlanAdjustment[] {
    const adjustments: PlanAdjustment[] = [];
    
    analysis.insights.forEach(insight => {
      if (insight.actionRequired) {
        adjustments.push({
          id: `adjustment_${Date.now()}_${Math.random()}`,
          type: insight.type,
          reason: insight.description,
          oldValue: 'Current',
          newValue: insight.recommendation,
          impact: 'positive',
          timestamp: new Date()
        });
      }
    });
    
    return adjustments;
  }

  private calculatePerformanceMetrics(analysis: AIAnalysis): PerformanceMetrics {
    // This would be a more complex calculation in a real implementation
    return {
      strength: {
        progressionRate: 2.5,
        volumeProgression: 5.0,
        intensityProgression: 3.0,
        plateauRisk: 20,
        recommendedDeload: false
      },
      endurance: {
        vo2Max: 45,
        lactateThreshold: 160,
        aerobicBase: 70,
        anaerobicCapacity: 85,
        efficiency: 75
      },
      recovery: {
        hrvTrend: 5,
        sleepQuality: 8,
        stressLevel: 3,
        readinessScore: 85,
        fatigueLevel: 2
      },
      nutrition: {
        adherence: 90,
        macroBalance: 85,
        timing: 80,
        hydration: 75,
        micronutrientScore: 70
      },
      consistency: {
        workoutFrequency: 4,
        nutritionConsistency: 85,
        sleepConsistency: 90,
        adherenceScore: 87,
        streakDays: 12
      }
    };
  }

  // Helper methods
  private calculateWeeklyVolume(workouts: WorkoutSession[]): number {
    return workouts.reduce((sum: number, workout: WorkoutSession) => {
      return sum + workout.exercises.reduce((exerciseSum: number, exercise: any) => {
        return exerciseSum + exercise.sets.length;
      }, 0);
    }, 0);
  }

  private calculateTargetVolume(exerciseCount: number): number {
    return exerciseCount * 3 * 4; // 3 sets per exercise, 4 workouts per week
  }

  private calculateHRVTrend(hrvData: any[]): number {
    if (hrvData.length < 7) return 0;
    
    const recent = hrvData.slice(-7);
    const older = hrvData.slice(-14, -7);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private analyzeMealTiming(nutrition: NutritionEntry[]): { gaps: number; frequency: number } {
    const mealTimes = nutrition.map(n => new Date(n.date).getHours()).sort((a, b) => a - b);
    const gaps = mealTimes.slice(1).map((time, i) => time - mealTimes[i]);
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    
    return {
      gaps: avgGap,
      frequency: nutrition.length / 7 // meals per day
    };
  }

  // Public methods
  getCurrentPlan(): AdaptivePlan | null {
    return this.currentPlan;
  }

  getAnalysisHistory(): AIAnalysis[] {
    return this.analysisHistory;
  }

  getLatestAnalysis(): AIAnalysis | null {
    return this.analysisHistory[this.analysisHistory.length - 1] || null;
  }
}

export const aiOptimizationService = new AIOptimizationService();

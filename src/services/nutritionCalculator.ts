import { UserProfile } from '../store';
import { poundsToKilograms } from '../utils/units';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in liters
  breakdown: {
    proteinPercent: number;
    carbPercent: number;
    fatPercent: number;
  };
  rationale: string[];
}

export interface BodyComposition {
  leanBodyMass: number; // kg
  bodyFatMass: number; // kg
  bodyFatPercentage: number;
}

export class NutritionCalculator {
  /**
   * Calculate lean body mass using the Boer formula (most accurate for athletes)
   */
  static calculateLeanBodyMass(weight: number, height: number, gender: 'male' | 'female'): number {
    const heightCm = height * 2.54;
    
    if (gender === 'male') {
      return (0.407 * weight) + (0.267 * heightCm) - 19.2;
    } else {
      return (0.252 * weight) + (0.473 * heightCm) - 48.3;
    }
  }

  /**
   * Calculate BMR using the Mifflin-St Jeor equation (most accurate)
   */
  static calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    const heightCm = height * 2.54;
    
    if (gender === 'male') {
      return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    }
  }

  /**
   * Calculate TDEE with activity multipliers based on research
   */
  static calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers = {
      'Sedentary': 1.2,        // Little to no exercise
      'Lightly Active': 1.375,  // Light exercise 1-3 days/week
      'Moderately Active': 1.55, // Moderate exercise 3-5 days/week
      'Very Active': 1.725     // Heavy exercise 6-7 days/week
    };
    
    return Math.round(bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.55));
  }

  /**
   * Calculate protein needs based on lean body mass and goals
   * Research-based recommendations from ISSN, ACSM, and NSCA
   */
  static calculateProteinNeeds(
    weight: number, 
    leanBodyMass: number, 
    bodyFatPercentage: number,
    activityLevel: string,
    goal: string
  ): number {
    let proteinPerKg: number;
    
    // Base protein needs by activity level and body composition
    if (bodyFatPercentage > 25) {
      // Higher body fat = use total weight for protein calculation
      proteinPerKg = 1.6; // Minimum for muscle preservation
    } else if (bodyFatPercentage > 15) {
      // Moderate body fat = use total weight
      proteinPerKg = 1.8;
    } else {
      // Low body fat = use lean body mass
      proteinPerKg = 2.0;
    }
    
    // Adjust for activity level
    if (activityLevel === 'Very Active') {
      proteinPerKg += 0.2;
    }
    
    // Adjust for specific goals
    switch (goal.toLowerCase()) {
      case 'muscle gain':
      case 'muscular':
      case 'nfl fullback':
      case 'power athlete':
        proteinPerKg += 0.3;
        break;
      case 'fat loss':
      case 'lean':
        proteinPerKg += 0.2; // Higher protein for satiety and muscle preservation
        break;
      case 'maintenance':
      case 'athletic':
        // Keep base amount
        break;
    }
    
    // Cap at 2.6g/kg (upper limit from research)
    proteinPerKg = Math.min(proteinPerKg, 2.6);
    
    return Math.round(weight * proteinPerKg);
  }

  /**
   * Calculate carbohydrate needs based on activity and goals
   * Based on ISSN and ACSM guidelines
   */
  static calculateCarbNeeds(
    weight: number,
    activityLevel: string,
    goal: string,
    tdee: number
  ): number {
    let carbPercent: number;
    
    // Base carb percentage by activity level
    switch (activityLevel) {
      case 'Sedentary':
        carbPercent = 0.35;
        break;
      case 'Lightly Active':
        carbPercent = 0.40;
        break;
      case 'Moderately Active':
        carbPercent = 0.45;
        break;
      case 'Very Active':
        carbPercent = 0.50;
        break;
      default:
        carbPercent = 0.45;
    }
    
    // Adjust for goals
    switch (goal.toLowerCase()) {
      case 'fat loss':
      case 'lean':
        carbPercent -= 0.05; // Lower carbs for fat loss
        break;
      case 'muscle gain':
      case 'muscular':
        carbPercent += 0.05; // Higher carbs for muscle gain
        break;
    }
    
    // Ensure minimum 20% and maximum 65%
    carbPercent = Math.max(0.20, Math.min(0.65, carbPercent));
    
    const carbCalories = tdee * carbPercent;
    return Math.round(carbCalories / 4); // 4 calories per gram of carbs
  }

  /**
   * Calculate fat needs (remaining calories after protein and carbs)
   * Minimum 0.8g/kg for hormone production
   */
  static calculateFatNeeds(
    weight: number,
    tdee: number,
    proteinGrams: number,
    carbGrams: number
  ): number {
    const proteinCalories = proteinGrams * 4;
    const carbCalories = carbGrams * 4;
    const remainingCalories = tdee - proteinCalories - carbCalories;
    
    // Minimum 0.8g/kg for hormone production
    const minFatGrams = weight * 0.8;
    const minFatCalories = minFatGrams * 9;
    
    // Use remaining calories or minimum, whichever is higher
    const fatCalories = Math.max(remainingCalories, minFatCalories);
    
    return Math.round(fatCalories / 9); // 9 calories per gram of fat
  }

  /**
   * Calculate fiber needs (14g per 1000 calories)
   */
  static calculateFiberNeeds(tdee: number): number {
    return Math.round((tdee / 1000) * 14);
  }

  /**
   * Calculate water needs based on weight and activity
   */
  static calculateWaterNeeds(weight: number, activityLevel: string): number {
    // Base: 35ml per kg body weight
    let baseWater = (weight * 35) / 1000; // Convert to liters
    
    // Add extra for activity
    switch (activityLevel) {
      case 'Moderately Active':
        baseWater += 0.5;
        break;
      case 'Very Active':
        baseWater += 1.0;
        break;
    }
    
    return Math.round(baseWater * 10) / 10; // Round to 1 decimal
  }

  /**
   * Shift maintenance calories for the stated goal, then build macros from that target.
   */
  private static adjustCaloriesForGoal(tdee: number, goal: string): number {
    const normalized = goal.toLowerCase();
    if (normalized.includes('loss') || normalized.includes('lean')) return Math.max(1200, tdee - 400);
    if (normalized.includes('gain') || normalized.includes('muscular') || normalized.includes('fullback')) {
      return tdee + 300;
    }
    return tdee;
  }

  /**
   * Main function to calculate all nutrition targets
   */
  static calculateNutritionTargets(profile: UserProfile): NutritionTargets {
    const gender = profile.sex === 'female' ? 'female' : 'male';
    const weightKg = poundsToKilograms(profile.weight);
    const bmr = this.calculateBMR(weightKg, profile.height, profile.age, gender);
    const tdee = this.adjustCaloriesForGoal(this.calculateTDEE(bmr, profile.activityLevel), profile.targetPhysique);
    
    const leanBodyMass = this.calculateLeanBodyMass(weightKg, profile.height, gender);
    const bodyFatPercentage = profile.bodyFatPercentage;
    
    const protein = this.calculateProteinNeeds(
      weightKg, 
      leanBodyMass, 
      bodyFatPercentage, 
      profile.activityLevel, 
      profile.targetPhysique
    );
    
    const carbs = this.calculateCarbNeeds(
      weightKg, 
      profile.activityLevel, 
      profile.targetPhysique, 
      tdee
    );
    
    const fat = this.calculateFatNeeds(weightKg, tdee, protein, carbs);
    const fiber = this.calculateFiberNeeds(tdee);
    const water = this.calculateWaterNeeds(weightKg, profile.activityLevel);
    
    // Calculate actual calories from macros
    const actualCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    
    // Calculate percentages
    const proteinPercent = Math.round((protein * 4 / actualCalories) * 100);
    const carbPercent = Math.round((carbs * 4 / actualCalories) * 100);
    const fatPercent = Math.round((fat * 9 / actualCalories) * 100);
    
    // Generate rationale
    const rationale = this.generateRationale(profile, protein, carbs, fat, tdee, bodyFatPercentage);
    
    return {
      calories: Math.round(actualCalories),
      protein,
      carbs,
      fat,
      fiber,
      water,
      breakdown: {
        proteinPercent,
        carbPercent,
        fatPercent
      },
      rationale
    };
  }

  /**
   * Generate scientific rationale for the recommendations
   */
  private static generateRationale(
    profile: UserProfile, 
    protein: number, 
    carbs: number, 
    fat: number, 
    tdee: number,
    bodyFatPercentage: number
  ): string[] {
    const rationale: string[] = [];
    
    // Protein rationale
    const weightKg = poundsToKilograms(profile.weight);
    if (bodyFatPercentage > 20) {
      rationale.push(`Protein: ${protein}g (${Math.round(protein/weightKg*10)/10}g/kg) - Based on total weight due to higher body fat percentage (${bodyFatPercentage}%)`);
    } else {
      rationale.push(`Protein: ${protein}g (${Math.round(protein/weightKg*10)/10}g/kg) - Optimized for lean body mass and muscle protein synthesis`);
    }
    
    // Carb rationale
    const carbPercent = Math.round((carbs * 4 / tdee) * 100);
    rationale.push(`Carbs: ${carbs}g (${carbPercent}% of calories) - Adjusted for ${profile.activityLevel.toLowerCase()} activity level and ${profile.targetPhysique.toLowerCase()} goals`);
    
    // Fat rationale
    const fatPercent = Math.round((fat * 9 / tdee) * 100);
    rationale.push(`Fat: ${fat}g (${fatPercent}% of calories) - Ensures adequate hormone production and essential fatty acid intake`);
    
    // Activity-specific notes
    if (profile.activityLevel === 'Very Active') {
      rationale.push('Higher protein and carb intake to support intense training and recovery');
    }
    
    // Goal-specific notes
    if (profile.targetPhysique.toLowerCase().includes('muscle') || profile.targetPhysique.toLowerCase().includes('power')) {
      rationale.push('Increased protein and carbs to support muscle growth and power development');
    } else if (profile.targetPhysique.toLowerCase().includes('lean')) {
      rationale.push('Moderate carbs with higher protein for fat loss while preserving muscle mass');
    }
    
    return rationale;
  }
}

export class CalculatorTool {
  /**
   * Calculate Body Mass Index
   */
  static calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Normal weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';

    return { bmi, category };
  }

  /**
   * Calculate Basal Metabolic Rate (Mifflin-St Jeor Equation)
   */
  static calculateBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender.toUpperCase() === 'MALE') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    return Math.round(bmr);
  }

  /**
   * Calculate Total Daily Energy Expenditure based on workout frequency
   */
  static calculateTDEE(bmr: number, frequencyDaysPerWeek: number): number {
    let multiplier = 1.2; // Sedentary
    if (frequencyDaysPerWeek >= 1 && frequencyDaysPerWeek <= 2) multiplier = 1.375;
    else if (frequencyDaysPerWeek >= 3 && frequencyDaysPerWeek <= 4) multiplier = 1.55;
    else if (frequencyDaysPerWeek >= 5) multiplier = 1.725;

    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate calorie and macronutrient targets based on goal
   */
  static calculateCalorieTarget(tdee: number, goalCategory: string, weightKg: number) {
    let targetCalories = tdee;
    if (goalCategory === 'WEIGHT_LOSS') targetCalories = Math.round(tdee * 0.82); // ~18% deficit
    else if (goalCategory === 'MUSCLE_GAIN') targetCalories = Math.round(tdee * 1.12); // ~12% surplus

    // Protein target: ~2.0g per kg for muscle/strength, ~1.8g for others
    const proteinG = Math.round(weightKg * 2.0);
    const fatG = Math.round((targetCalories * 0.25) / 9); // 25% of calories from fat
    const remainingCalories = targetCalories - (proteinG * 4 + fatG * 9);
    const carbsG = Math.max(50, Math.round(remainingCalories / 4));

    return {
      targetCalories,
      proteinG,
      carbsG,
      fatG,
    };
  }

  /**
   * Calculate workout volume: sets x reps x weight
   */
  static calculateWorkoutVolume(sets: Array<{ reps: number; weightKg: number }>): number {
    return sets.reduce((acc, s) => acc + s.reps * s.weightKg, 0);
  }
}

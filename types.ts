export interface UserProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  height: number;
  weight: number;
  dietaryPreference: 'Vegetarian' | 'Non-Vegetarian';
  primaryGoal: {
    type: 'Medical' | 'Fitness';
    detail: string;
    customDetail?: string;
  };
  profession: string;
  customProfession?: string;
}

export interface NutritionInfo {
  foodName: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  recommendation: 'Should Eat' | 'Moderate' | 'Avoid';
  servingSize: string;
  reason: string;
}

export interface Meal {
    name: string;
    description: string;
}

export interface DayPlan {
    day: string;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
}

export interface MealPlan {
    weeklyPlan: DayPlan[];
}

export interface ShoppingList {
    categories: {
        category: string;
        items: string[];
    }[];
}

export interface Exercise {
    name: string;
    sets: string;
    reps: string;
    description: string;
}

export interface DailyWorkout {
    day: string;
    focus: string;
    exercises: Exercise[];
}

export interface WorkoutPlan {
    weeklyWorkoutPlan: DailyWorkout[];
}

export interface MoodLog {
    mood: 'Happy' | 'Neutral' | 'Sad' | 'Stressed' | 'Energized';
    notes: string;
    date: string; // ISO string
}

export interface CommunityPost {
    id: number;
    author: string;
    avatarUrl: string;
    content: string;
    likes: number;
    comments: number;
    timestamp: string;
}


export type AuthStatus = 'LOGGED_OUT' | 'LOGGED_IN' | 'ONBOARDING';
export type AuthView = 'LOGIN' | 'SIGNUP' | 'RESET';
export type DashboardView = 'HOME' | 'SCANNING' | 'UPLOADING' | 'ANALYZING' | 'RESULT' | 'ERROR';
export type ScanMode = 'food' | 'qr' | null;
import {
    NutritionInfo,
    MealPlan,
    ShoppingList,
    WorkoutPlan,
    DayPlan,
    DailyWorkout
} from '../types';
import {
    translateTexts
} from '../services/geminiService';

type Language = 'en' | 'hi';

export const translateNutritionInfo = async (info: NutritionInfo, language: Language): Promise < NutritionInfo > => {
    if (language === 'en' || !info) return info;

    const textsToTranslate = [info.foodName, info.servingSize, info.reason];
    const translations = await translateTexts(textsToTranslate, 'Hindi');

    return {
        ...info,
        foodName: translations[0] || info.foodName,
        servingSize: translations[1] || info.servingSize,
        reason: translations[2] || info.reason,
    };
};

export const translateMealPlan = async (plan: MealPlan, language: Language): Promise < MealPlan > => {
    if (language === 'en' || !plan) return plan;

    const textsToTranslate = plan.weeklyPlan.flatMap(day => [
        day.day,
        day.breakfast.name,
        day.breakfast.description,
        day.lunch.name,
        day.lunch.description,
        day.dinner.name,
        day.dinner.description,
    ]);

    const translations = await translateTexts(textsToTranslate, 'Hindi');

    let i = 0;
    const translatedWeeklyPlan = plan.weeklyPlan.map(day => ({
        day: translations[i++] || day.day,
        breakfast: {
            name: translations[i++] || day.breakfast.name,
            description: translations[i++] || day.breakfast.description,
        },
        lunch: {
            name: translations[i++] || day.lunch.name,
            description: translations[i++] || day.lunch.description,
        },
        dinner: {
            name: translations[i++] || day.dinner.name,
            description: translations[i++] || day.dinner.description,
        },
    } as DayPlan));

    return {
        weeklyPlan: translatedWeeklyPlan
    };
};

export const translateShoppingList = async (list: ShoppingList, language: Language): Promise < ShoppingList > => {
    if (language === 'en' || !list) return list;

    const textsToTranslate = list.categories.flatMap(cat => [
        cat.category,
        ...cat.items
    ]);
    const translations = await translateTexts(textsToTranslate, 'Hindi');

    let i = 0;
    const translatedCategories = list.categories.map(cat => {
        const translatedCategory = translations[i++] || cat.category;
        const translatedItems = cat.items.map(() => translations[i++] || '');
        return {
            category: translatedCategory,
            items: translatedItems.filter(Boolean), // Filter out potential empty strings
        };
    });

    return {
        categories: translatedCategories
    };
};

export const translateWorkoutPlan = async (plan: WorkoutPlan, language: Language): Promise < WorkoutPlan > => {
    if (language === 'en' || !plan) return plan;

    const textsToTranslate = plan.weeklyWorkoutPlan.flatMap(day => [
        day.day,
        day.focus,
        ...day.exercises.flatMap(ex => [ex.name, ex.description])
    ]);

    const translations = await translateTexts(textsToTranslate, 'Hindi');

    let i = 0;
    const translatedWeeklyPlan = plan.weeklyWorkoutPlan.map(day => {
        const translatedDay = {
            day: translations[i++] || day.day,
            focus: translations[i++] || day.focus,
            exercises: day.exercises.map(ex => ({
                ...ex,
                name: translations[i++] || ex.name,
                description: translations[i++] || ex.description,
            }))
        } as DailyWorkout;
        return translatedDay;
    });

    return {
        weeklyWorkoutPlan: translatedWeeklyPlan
    };
};

import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, NutritionInfo, MealPlan, ShoppingList, WorkoutPlan } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.warn("API_KEY not found in environment variables. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const nutritionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        foodName: {
            type: Type.STRING,
            description: "The name of the food item identified in the image."
        },
        nutrition: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.NUMBER, description: "Estimated calories in kcal." },
                protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
                carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
                fats: { type: Type.NUMBER, description: "Estimated fats in grams." },
            },
            required: ["calories", "protein", "carbs", "fats"]
        },
        recommendation: {
            type: Type.STRING,
            enum: ["Should Eat", "Moderate", "Avoid"],
            description: "A recommendation based on the user's profile and the food's nutritional value."
        },
        servingSize: {
            type: Type.STRING,
            description: "A suggested appropriate serving size, e.g., '1 cup' or '100 grams'."
        },
        reason: {
            type: Type.STRING,
            description: "A brief, one-sentence explanation for the recommendation, tailored to the user's goals."
        }
    },
    required: ["foodName", "nutrition", "recommendation", "servingSize", "reason"]
};

const mealPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        weeklyPlan: {
            type: Type.ARRAY,
            description: "An array of 7 daily meal plans.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
                    breakfast: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING, description: "A short description of the meal." }
                        },
                        required: ["name", "description"]
                    },
                    lunch: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING, description: "A short description of the meal." }
                        },
                        required: ["name", "description"]
                    },
                    dinner: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING, description: "A short description of the meal." }
                        },
                         required: ["name", "description"]
                    }
                },
                 required: ["day", "breakfast", "lunch", "dinner"]
            }
        }
    },
    required: ["weeklyPlan"]
};

const shoppingListSchema = {
    type: Type.OBJECT,
    properties: {
        categories: {
            type: Type.ARRAY,
            description: "A list of food categories.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "Category name (e.g., Vegetables, Dairy, Meat)." },
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of items in this category."
                    }
                },
                required: ["category", "items"]
            }
        }
    },
    required: ["categories"]
};

const workoutPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        weeklyWorkoutPlan: {
            type: Type.ARRAY,
            description: "An array of 7 daily workout plans.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
                    focus: { type: Type.STRING, description: "The main focus of the day's workout (e.g., 'Full Body Strength', 'Cardio & Core', 'Rest Day')." },
                    exercises: {
                        type: Type.ARRAY,
                        description: "A list of exercises for the day. Should be empty if it's a rest day.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                sets: { type: Type.STRING, description: "Number of sets (e.g., '3' or '3-4')." },
                                reps: { type: Type.STRING, description: "Number of reps or duration (e.g., '8-12' or '30 seconds')." },
                                description: { type: Type.STRING, description: "A short, one-sentence tip on performing the exercise." }
                            },
                            required: ["name", "sets", "reps", "description"]
                        }
                    }
                },
                required: ["day", "focus", "exercises"]
            }
        }
    },
    required: ["weeklyWorkoutPlan"]
};


const getUserProfileSummary = (userProfile: UserProfile) => `
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Height: ${userProfile.height} cm
    - Weight: ${userProfile.weight} kg
    - Dietary Preference: ${userProfile.dietaryPreference}
    - Primary Goal: ${userProfile.primaryGoal.type} - ${userProfile.primaryGoal.detail} ${userProfile.primaryGoal.customDetail ? `(${userProfile.primaryGoal.customDetail})` : ''}
    - Profession/Activity Level: ${userProfile.profession} ${userProfile.customProfession ? `(${userProfile.customProfession})` : ''}
`;

export const analyzeFoodImage = async (
    base64ImageData: string,
    mimeType: string,
    userProfile: UserProfile,
    scanMode: 'food' | 'qr'
): Promise<NutritionInfo> => {
    
    const userProfileSummary = getUserProfileSummary(userProfile);

    let prompt: string;
    let model: string = 'gemini-2.5-flash';
    let contents: any;

    if (scanMode === 'food') {
        prompt = `
            Analyze the food item in this image. Based on the following user profile, provide a nutritional analysis and a personalized recommendation.
            
            User Profile:
            ${userProfileSummary}

            Your task:
            1.  Identify the primary food item in the image.
            2.  Estimate its nutritional information (calories, protein, carbs, fats) for a typical serving.
            3.  Based on the user's profile (especially their dietary preference and primary goal), provide a recommendation: "Should Eat", "Moderate", or "Avoid".
            4.  Suggest a healthy serving size.
            5.  Provide a short, one-sentence reason for your recommendation.
            
            Return the response ONLY in the specified JSON format.
        `;
        contents = {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType,
                        data: base64ImageData,
                    },
                },
            ],
        };

    } else { // scanMode === 'qr'
        // For QR/barcode, we expect the base64ImageData to be the decoded text from the QR/barcode
        const productInfo = base64ImageData; 
        prompt = `
            A user has scanned a product with the following information: "${productInfo}". Assume this is from a barcode or QR code.
            
            Based on this information and the user's profile below, provide a nutritional analysis and personalized recommendation. If the product isn't a food item, state that.
            
            User Profile:
            ${userProfileSummary}

            Your task:
            1.  Identify the food product from the scanned information.
            2.  Find or estimate its nutritional information (calories, protein, carbs, fats).
            3.  Based on the user's profile, provide a recommendation: "Should Eat", "Moderate", "Avoid".
            4.  Suggest a healthy serving size from the package information if available.
            5.  Provide a short, one-sentence reason for your recommendation.
            
            Return the response ONLY in the specified JSON format.
        `;
        contents = { parts: [{ text: prompt }] };
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: nutritionResponseSchema,
            },
        });
        
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        
        return result as NutritionInfo;
    } catch (error) {
        console.error("Error analyzing food image:", error);
        throw new Error("Failed to analyze image. The AI model could not process the request.");
    }
};

export const generateMealPlan = async (userProfile: UserProfile): Promise<MealPlan> => {
    const userProfileSummary = getUserProfileSummary(userProfile);
    const prompt = `
        Create a healthy and balanced 7-day meal plan (Monday to Sunday) for the following user. The meals should be simple to prepare and delicious.
        
        User Profile:
        ${userProfileSummary}

        Your task:
        - Generate a plan with breakfast, lunch, and dinner for each of the 7 days.
        - For each meal, provide a name and a short (one-sentence) description.
        - Ensure the plan aligns with the user's dietary preferences and primary goal.
        - Return the response ONLY in the specified JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: mealPlanResponseSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText) as MealPlan;
    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw new Error("Failed to generate a meal plan. The AI model could not process the request.");
    }
};

export const generateShoppingList = async (mealPlan: MealPlan): Promise<ShoppingList> => {
    const prompt = `
        Based on the following weekly meal plan, create a consolidated shopping list.
        Organize the items into logical categories (e.g., Vegetables, Fruits, Meat, Dairy, Pantry Staples).

        Meal Plan:
        ${JSON.stringify(mealPlan, null, 2)}

        Your task:
        - Read through all meals for the week.
        - Create a list of all necessary ingredients.
        - Group the ingredients into logical shopping categories.
        - Please make the list budget-friendly and prioritize seasonal options where appropriate.
        - Return the response ONLY in the specified JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingListSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText) as ShoppingList;
    } catch (error) {
        console.error("Error generating shopping list:", error);
        throw new Error("Failed to generate a shopping list. The AI model could not process the request.");
    }
};

export const generateWorkoutPlan = async (userProfile: UserProfile): Promise<WorkoutPlan> => {
    const userProfileSummary = getUserProfileSummary(userProfile);
    const prompt = `
        Create a balanced and effective 7-day workout plan (Monday to Sunday) for the user below. The plan should be suitable for their activity level and aligned with their primary goal. Assume minimal to no gym equipment unless their goal implies professional training.

        User Profile:
        ${userProfileSummary}

        Your task:
        - Generate a 7-day plan. Include at least one rest day.
        - For each day, provide a clear 'focus' (e.g., 'Full Body Strength', 'Cardio & Core', 'Active Recovery', 'Rest Day').
        - For workout days, list 3-5 exercises.
        - For each exercise, provide a name, the number of sets, the number of reps (or duration), and a very short, one-sentence description or tip.
        - If it is a Rest Day, the 'exercises' array should be empty.
        - Return the response ONLY in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanResponseSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText) as WorkoutPlan;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        throw new Error("Failed to generate a workout plan. The AI model could not process the request.");
    }
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, NutritionInfo, DashboardView, ScanMode, MealPlan, ShoppingList, WorkoutPlan, MoodLog, CommunityPost } from '../types';
import { analyzeFoodImage, generateMealPlan, generateShoppingList, generateWorkoutPlan } from '../services/geminiService';
import { translateNutritionInfo, translateMealPlan, translateShoppingList, translateWorkoutPlan } from '../utils/translator';
import { SunIcon, MoonIcon, CameraIcon, QrCodeIcon, UploadIcon, UserIcon, LogoutIcon, LanguageIcon, ChevronDownIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, TrendingUpIcon, HistoryIcon, HomeIcon, MealPlanIcon, CommunityIcon, DumbbellIcon, UsersIcon, WellnessIcon, SparklesIcon, ThumbsUpIcon, MessageCircleIcon, ChevronLeftIcon, MenuIcon, XIcon } from './Icons';
import { useLanguage } from '../App';
import { Chatbot } from './Chatbot';

type Page = 'DASHBOARD' | 'PROGRESS' | 'HISTORY' | 'MEAL_PLAN' | 'WORKOUTS' | 'WELLNESS' | 'COMMUNITY' | 'CONSULTATIONS';

// Declare jsQR for TypeScript
declare const jsQR: any;

// Helper: Theme Toggle
const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );
};

// Helper: Language Selector
const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectLanguage = (lang: 'en' | 'hi') => {
        setLanguage(lang);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <LanguageIcon className="w-6 h-6" />
                <span className="hidden md:inline font-semibold text-sm">{language.toUpperCase()}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                    <button onClick={() => selectLanguage('en')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">English (EN)</button>
                    <button onClick={() => selectLanguage('hi')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">हिन्दी (HI)</button>
                </div>
            )}
        </div>
    );
};


// Helper: User Menu
const UserMenu = ({ userProfile, onLogout }: { userProfile: UserProfile, onLogout: () => void }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <UserIcon className="w-6 h-6" />
                <span className="hidden md:inline">{userProfile.name.split(' ')[0]}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">{userProfile.name}</div>
                    <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('editProfile')}</a>
                    <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings')}</a>
                    <button onClick={onLogout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogoutIcon className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper: Camera View
interface CameraViewProps {
    onCapture: (imageData: string, mimeType: string) => void;
    onCancel: () => void;
    scanMode: ScanMode;
}
const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel, scanMode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // FIX: Initialize useRef with null to provide a defined initial value.
    const animationFrameId = useRef<number | null>(null);

    const scanQRCode = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });
                    if (code) {
                        onCapture(code.data, 'text/plain');
                        // No need to stop loop here, component will unmount on parent state change
                        return; 
                    }
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(scanQRCode);
    }, [onCapture]);


    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Start scanning loop only when video metadata is loaded
                    videoRef.current.onloadedmetadata = () => {
                         if (scanMode === 'qr') {
                            animationFrameId.current = requestAnimationFrame(scanQRCode);
                        }
                    };
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access the camera. Please check permissions.");
                onCancel();
            }
        };

        startCamera();
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [onCancel, scanMode, scanQRCode]);
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if(context) {
                const video = videoRef.current;
                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const mimeType = 'image/jpeg';
                const dataUrl = canvasRef.current.toDataURL(mimeType, 0.9);
                const base64Data = dataUrl.split(',')[1];
                onCapture(base64Data, mimeType);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <div className="relative w-full max-w-lg aspect-square">
                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg"></video>
                 <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none opacity-50"></div>
            </div>
            <p className="text-white mt-4">{scanMode === 'food' ? 'Position food in the frame' : 'Scanning for QR code...'}</p>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="mt-6 flex space-x-4">
                <button onClick={onCancel} className="px-6 py-3 bg-gray-600 text-white rounded-full font-semibold">Cancel</button>
                {scanMode === 'food' && (
                    <button onClick={handleCapture} className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold flex items-center space-x-2">
                        <CameraIcon className="w-6 h-6" />
                        <span>Capture</span>
                    </button>
                )}
            </div>
        </div>
    );
};

// Helper: Analysis Result
const AnalysisResult: React.FC<{ result: NutritionInfo, onBack: () => void }> = ({ result, onBack }) => {
    const { t } = useLanguage();

    const getRecommendationText = (recommendation: NutritionInfo['recommendation']) => {
        switch (recommendation) {
            case 'Should Eat': return t('shouldEat');
            case 'Moderate': return t('moderate');
            case 'Avoid': return t('avoid');
            default: return recommendation;
        }
    };

    const getRecommendationColor = () => {
        switch (result.recommendation) {
            case 'Should Eat': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Avoid': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
     const getRecommendationIcon = () => {
        switch (result.recommendation) {
            case 'Should Eat': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'Moderate': return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case 'Avoid': return <XCircleIcon className="w-5 h-5 text-red-500" />;
        }
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-center capitalize">{result.foodName}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${getRecommendationColor()}`}>
                    {getRecommendationIcon()}
                    <span className="font-semibold">{getRecommendationText(result.recommendation)}</span>
                </div>
                 <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{result.reason}"</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center pt-4 border-t dark:border-gray-700">
                    <div>
                        <p className="text-2xl font-bold text-primary-500">{result.nutrition.calories}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('calories')} (kcal)</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-primary-500">{result.nutrition.protein}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('protein')} (g)</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-primary-500">{result.nutrition.carbs}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('carbs')} (g)</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-primary-500">{result.nutrition.fats}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('fats')} (g)</p>
                    </div>
                </div>
                <div className="text-center pt-4 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('suggestedServingSize')}</p>
                    <p className="text-lg font-semibold">{result.servingSize}</p>
                </div>
            </div>
            <button onClick={onBack} className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">{t('scanAnotherItem')}</button>
        </div>
    );
};

// Helper: Progress Circle
const ProgressCircle: React.FC<{ value: number, maxValue: number, label: string, color: string, unit: string }> = ({ value, maxValue, label, color, unit }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / maxValue, 1);
    const offset = circumference - progress * circumference;

    return (
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                    <circle
                        className={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{Math.round(value)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">/{maxValue}{unit}</span>
                </div>
            </div>
            <p className="mt-3 font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        </div>
    );
};

// Helper: Water Intake Tracker
const WaterIntakeTracker: React.FC<{ progress: any, setProgress: React.Dispatch<any> }> = ({ progress, setProgress }) => {
    const { t } = useLanguage();
    const handleWaterChange = (amount: number) => {
        setProgress((prev: any) => ({ ...prev, water: Math.max(0, prev.water + amount) }));
    };
    const waterPercentage = Math.min((progress.water / progress.waterGoal) * 100, 100);

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg col-span-2 lg:col-span-4">
            <h3 className="font-bold mb-4 text-center">{t('waterIntake')}</h3>
            <div className="flex items-center justify-center space-x-4">
                <button onClick={() => handleWaterChange(-250)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-lg">-</button>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                    <div
                        className="bg-blue-500 h-8 rounded-full transition-all duration-500 text-white flex items-center justify-end pr-2 text-sm"
                        style={{ width: `${waterPercentage}%` }}
                    >
                        {progress.water}ml
                    </div>
                </div>
                <button onClick={() => handleWaterChange(250)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-lg">+</button>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{t('waterGoal', { goal: progress.waterGoal })}</p>
        </div>
    );
};

// New Page Component: History
const HistoryPage: React.FC<{ history: NutritionInfo[] }> = ({ history }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const filteredHistory = history.filter(item => item.foodName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-center">{t('scanHistory')}</h2>
            <input
                type="text"
                placeholder={t('searchHistory')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="space-y-4">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                        <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg capitalize">{item.foodName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.nutrition.calories} kcal</p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{new Date().toLocaleDateString()}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noHistory')}</p>
                )}
            </div>
        </div>
    );
};

// New Page Component: Track Progress
const TrackProgressPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8">
            <h2 className="text-3xl font-bold text-center">{t('trackProgress')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold mb-4">Weight Progress (kg)</h3>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">Chart Placeholder</div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold mb-4">Calorie Intake Trend</h3>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">Chart Placeholder</div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold mb-4">Goal Milestones</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" /> Scanned 10 items</li>
                        <li className="flex items-center text-gray-400"><CheckCircleIcon className="w-5 h-5 mr-2" /> Reach weight goal</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// New Page Component: Meal Plan
const MealPlanPage: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { t, language } = useLanguage();
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        setShoppingList(null);
        try {
            const plan = await generateMealPlan(userProfile);
            const translatedPlan = await translateMealPlan(plan, language);
            setMealPlan(translatedPlan);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate plan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateShoppingList = async () => {
        if (!mealPlan) return;
        setIsLoading(true);
        setError(null);
         try {
            const list = await generateShoppingList(mealPlan);
            const translatedList = await translateShoppingList(list, language);
            setShoppingList(translatedList);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate shopping list.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-center">{t('yourWeeklyMealPlan')}</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                 <button onClick={handleGeneratePlan} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300 transition-colors">
                    {isLoading && !mealPlan ? t('generatingPlan') : t('generateNewWeeklyPlan')}
                </button>
                {mealPlan && (
                    <button onClick={handleGenerateShoppingList} disabled={isLoading} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition-colors">
                         {isLoading && shoppingList === null ? t('generatingList') : t('generateShoppingList')}
                    </button>
                )}
            </div>
            
            {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
            
            {shoppingList ? (
                 <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold text-2xl mb-4">{t('shoppingList')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shoppingList.categories.map(cat => (
                            <div key={cat.category}>
                                <h4 className="font-semibold text-primary-500 mb-2">{cat.category}</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {cat.items.map(item => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ) : mealPlan ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mealPlan.weeklyPlan.map(day => (
                        <div key={day.day} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-3">
                            <h3 className="font-bold text-lg text-primary-600 dark:text-primary-400">{day.day}</h3>
                            <div className="text-sm">
                                <p><strong className="font-semibold">B:</strong> {day.breakfast.name} - <span className="text-gray-500 dark:text-gray-400">{day.breakfast.description}</span></p>
                                <p><strong className="font-semibold">L:</strong> {day.lunch.name} - <span className="text-gray-500 dark:text-gray-400">{day.lunch.description}</span></p>
                                <p><strong className="font-semibold">D:</strong> {day.dinner.name} - <span className="text-gray-500 dark:text-gray-400">{day.dinner.description}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Click the button to generate your personalized meal plan!</p>
            )}
        </div>
    );
};

// New Page Component: Workout Plan
const WorkoutPage: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const { t, language } = useLanguage();
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const plan = await generateWorkoutPlan(userProfile);
            const translatedPlan = await translateWorkoutPlan(plan, language);
            setWorkoutPlan(translatedPlan);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate workout plan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-center">{t('yourWeeklyWorkoutPlan')}</h2>
            <div className="text-center">
                 <button onClick={handleGeneratePlan} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300 transition-colors">
                    {isLoading ? t('generatingPlan') : t('generateNewWorkoutPlan')}
                </button>
            </div>
            
            {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
            
            {workoutPlan ? (
                 <div className="space-y-6">
                    {workoutPlan.weeklyWorkoutPlan.map(day => (
                        <div key={day.day} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <h3 className="font-bold text-xl text-primary-600 dark:text-primary-400">{day.day} - <span className="font-medium text-gray-600 dark:text-gray-300">{day.focus}</span></h3>
                            {day.exercises.length > 0 ? (
                                <ul className="mt-4 space-y-3">
                                    {day.exercises.map(ex => (
                                        <li key={ex.name} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex justify-between items-center font-semibold">
                                                <span>{ex.name}</span>
                                                <span className="text-sm">{ex.sets} sets x {ex.reps} reps</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ex.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Rest day. Enjoy your recovery!</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Click the button to generate your personalized workout plan!</p>
            )}
        </div>
    );
};

// New Page Component: Wellness
const WellnessPage: React.FC<{ moodHistory: MoodLog[], setMoodHistory: React.Dispatch<React.SetStateAction<MoodLog[]>> }> = ({ moodHistory, setMoodHistory }) => {
    const { t } = useLanguage();
    const [selectedMood, setSelectedMood] = useState<MoodLog['mood'] | null>(null);
    const [notes, setNotes] = useState('');

    const moods: { name: MoodLog['mood'], emoji: string, color: string }[] = [
        { name: 'Happy', emoji: '😊', color: 'bg-green-100 dark:bg-green-900 border-green-400' },
        { name: 'Neutral', emoji: '😐', color: 'bg-gray-100 dark:bg-gray-700 border-gray-400' },
        { name: 'Sad', emoji: '😢', color: 'bg-blue-100 dark:bg-blue-900 border-blue-400' },
        { name: 'Stressed', emoji: '😫', color: 'bg-red-100 dark:bg-red-900 border-red-400' },
        { name: 'Energized', emoji: '⚡️', color: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400' },
    ];

    const handleLogMood = () => {
        if (!selectedMood) {
            alert("Please select a mood.");
            return;
        }
        const newLog: MoodLog = {
            mood: selectedMood,
            notes,
            date: new Date().toISOString(),
        };
        setMoodHistory([newLog, ...moodHistory]);
        setSelectedMood(null);
        setNotes('');
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
            <h2 className="text-3xl font-bold text-center">{t('mentalWellnessCorner')}</h2>
            
            {/* Mood Tracker */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="font-bold text-xl mb-4">{t('howAreYouFeeling')}</h3>
                <div className="flex justify-around mb-4">
                    {moods.map(mood => (
                        <button key={mood.name} onClick={() => setSelectedMood(mood.name)} className={`p-3 rounded-full text-3xl border-2 transition-transform transform hover:scale-110 ${selectedMood === mood.name ? mood.color : 'border-transparent'}`}>
                            {mood.emoji}
                        </button>
                    ))}
                </div>
                <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder={t('addANote')}
                    className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button onClick={handleLogMood} className="w-full mt-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300" disabled={!selectedMood}>
                    {t('logMood')}
                </button>
            </div>

            {/* Mood History */}
            {moodHistory.length > 0 && (
                 <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold text-xl mb-4">{t('yourMoodHistory')}</h3>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {moodHistory.map((log, index) => (
                            <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{moods.find(m => m.name === log.mood)?.emoji}</span>
                                        <div>
                                            <p className="font-semibold">{log.mood}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{log.notes}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Meditation Placeholder */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
                <h3 className="font-bold text-xl mb-4">{t('guidedMeditation')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('comingSoon')}</p>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                    Audio Player Placeholder
                </div>
            </div>
        </div>
    );
};

// New Page Component: Community
const CommunityPage: React.FC = () => {
    const { t } = useLanguage();
    const mockPosts: CommunityPost[] = [
        { id: 1, author: 'Jane Doe', avatarUrl: `https://i.pravatar.cc/150?u=jane`, content: "Just finished my first week of the AI-generated meal plan and I feel amazing! 🥗 So much more energy.", likes: 23, comments: 5, timestamp: '2h ago' },
        { id: 2, author: 'John Smith', avatarUrl: `https://i.pravatar.cc/150?u=john`, content: "Hit a new personal best on my squats today thanks to the workout plan. Let's go! 💪", likes: 45, comments: 12, timestamp: '5h ago' },
        { id: 3, author: 'Alice Johnson', avatarUrl: `https://i.pravatar.cc/150?u=alice`, content: "Does anyone have tips for staying hydrated during the day? I keep forgetting to drink water.", likes: 15, comments: 8, timestamp: '1d ago' },
    ];

    return (
         <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
             <h2 className="text-3xl font-bold text-center">{t('communityFeed')}</h2>
             <div className="space-y-4">
                 {mockPosts.map(post => (
                    <div key={post.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="flex items-start space-x-4">
                            <img src={post.avatarUrl} alt={post.author} className="w-12 h-12 rounded-full" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{post.author}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                                </div>
                                <p className="mt-1 text-gray-700 dark:text-gray-300">{post.content}</p>
                                <div className="flex items-center space-x-4 mt-3 text-gray-500 dark:text-gray-400">
                                    <button className="flex items-center space-x-1 hover:text-primary-500">
                                        <ThumbsUpIcon className="w-4 h-4" />
                                        <span className="text-sm">{post.likes}</span>
                                    </button>
                                     <button className="flex items-center space-x-1 hover:text-primary-500">
                                        <MessageCircleIcon className="w-4 h-4" />
                                        <span className="text-sm">{post.comments}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                 ))}
             </div>
        </div>
    );
};

// New Page Component: Consultations
const ConsultationsPage: React.FC = () => {
    const { t } = useLanguage();
    return (
         <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
             <div className="relative inline-block">
                <UsersIcon className="w-24 h-24 mx-auto text-primary-400" />
                <div className="absolute -top-2 -right-2 p-1 bg-yellow-400 rounded-full">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
             </div>
             <p className="font-semibold text-yellow-500">{t('premiumFeature')}</p>
             <h2 className="text-4xl font-bold">{t('bookExpertConsultations')}</h2>
             <p className="text-lg text-gray-600 dark:text-gray-400">Upgrade to Premium to unlock exclusive access to certified dietitians and fitness coaches. Get personalized advice tailored just for you.</p>
             <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                {t('upgradeToPremium')}
            </button>
        </div>
    );
};

// Reusable Sidebar Navigation
const SidebarNav: React.FC<{
    activePage: Page;
    onPageChange: (page: Page) => void;
    isCollapsed: boolean;
    t: (key: any) => string;
}> = ({ activePage, onPageChange, isCollapsed, t }) => {
    // FIX: Add `as const` to infer literal types for `page`, making it compatible with the `Page` type.
    const navItems = [
        { page: 'DASHBOARD', icon: HomeIcon, label: t('dashboard') },
        { page: 'MEAL_PLAN', icon: MealPlanIcon, label: t('mealPlan') },
        { page: 'WORKOUTS', icon: DumbbellIcon, label: t('workouts') },
        { page: 'WELLNESS', icon: WellnessIcon, label: t('wellness') },
        { page: 'PROGRESS', icon: TrendingUpIcon, label: t('trackProgress') },
        { page: 'HISTORY', icon: HistoryIcon, label: t('history') },
    ] as const;
    // FIX: Add `as const` to infer literal types for `page`, making it compatible with the `Page` type.
    const secondaryNavItems = [
        { page: 'COMMUNITY', icon: CommunityIcon, label: t('community'), premium: false },
        { page: 'CONSULTATIONS', icon: UsersIcon, label: t('consultExperts'), premium: true },
    ] as const;

// FIX: Define a named type for the component props to avoid issues with anonymous types in JSX.
type NavButtonProps = { page: Page; icon: React.ElementType; label: string; isPremium?: boolean };

    const NavButton = ({ page, icon: Icon, label, isPremium }: NavButtonProps) => (
        <button
            onClick={() => onPageChange(page)}
            className={`relative flex items-center p-2 rounded-lg transition-colors w-full ${activePage === page ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'} ${isCollapsed ? 'justify-center' : ''}`}
        >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{label}</span>
            {isPremium && (
                <span className={`absolute top-1 right-1 p-0.5 text-xs bg-yellow-400 text-white rounded-full ${isCollapsed ? 'hidden' : ''}`}>
                    <SparklesIcon className="w-3 h-3"/>
                </span>
            )}
        </button>
    );

    return (
        <nav className="flex flex-col space-y-2">
            {/* FIX: Explicitly pass props instead of spreading to avoid potential type issues. */}
            {navItems.map(item => <NavButton key={item.page} page={item.page} icon={item.icon} label={item.label} />)}
            <div className="pt-2 mt-2 border-t dark:border-gray-700">
                {secondaryNavItems.map(item => <NavButton key={item.page} page={item.page} icon={item.icon} label={item.label} isPremium={item.premium} />)}
            </div>
        </nav>
    );
};

// Mobile Off-Canvas Sidebar
const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-50 transition-transform duration-300 transform sm:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">NutriScan AI</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-2">
                    {children}
                </div>
            </div>
        </>
    );
};

// Main Dashboard Component
interface DashboardProps {
    userProfile: UserProfile;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onLogout }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState<DashboardView>('HOME');
    const [scanMode, setScanMode] = useState<ScanMode>(null);
    const [analysisResult, setAnalysisResult] = useState<NutritionInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activePage, setActivePage] = useState<Page>('DASHBOARD');
    const [scanHistory, setScanHistory] = useState<NutritionInfo[]>(() => {
        const savedHistory = localStorage.getItem('scanHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [dailyProgress, setDailyProgress] = useState(() => {
        const savedProgress = localStorage.getItem('dailyProgress');
        return savedProgress ? JSON.parse(savedProgress) : { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, waterGoal: 2500 };
    });
    const [moodHistory, setMoodHistory] = useState<MoodLog[]>(() => {
        const saved = localStorage.getItem('moodHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Dynamic Theming Effect
    useEffect(() => {
        const goal = userProfile.primaryGoal;
        const root = document.documentElement;

        if (goal.type === 'Medical') {
            root.setAttribute('data-theme', 'purple');
        } else if (goal.type === 'Fitness') {
            switch (goal.detail) {
                case 'Muscle Gain':
                    root.setAttribute('data-theme', 'orange');
                    break;
                case 'Maintenance':
                    root.setAttribute('data-theme', 'blue');
                    break;
                case 'Weight Loss':
                default:
                    // Default green theme
                    root.removeAttribute('data-theme');
                    break;
            }
        } else {
             // Default green theme
            root.removeAttribute('data-theme');
        }

        return () => {
            root.removeAttribute('data-theme');
        }
    }, [userProfile.primaryGoal]);

    useEffect(() => {
        setDailyProgress(prev => ({ ...prev, waterGoal: Math.round(userProfile.weight * 35) }));
    }, [userProfile.weight]);

    useEffect(() => {
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
    }, [scanHistory]);

     useEffect(() => {
        localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
    }, [dailyProgress]);

    useEffect(() => {
        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    }, [moodHistory]);
    
    const handleScanStart = (mode: ScanMode) => {
        setScanMode(mode);
        setView('SCANNING');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setView('ANALYZING');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if(base64String) {
                    performAnalysis(base64String, file.type, 'food');
                } else {
                    setError("Could not read file.");
                    setView('ERROR');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const performAnalysis = useCallback(async (data: string, mimeType: string, mode: ScanMode) => {
        if (!mode) return;
        setView('ANALYZING');
        setError(null);
        try {
            let result = await analyzeFoodImage(data, mimeType, userProfile, mode);
            result = await translateNutritionInfo(result, language);
            setAnalysisResult(result);
            
            const newHistory = [result, ...scanHistory];
            setScanHistory(newHistory.slice(0, 50));
            setDailyProgress((prev: any) => ({
                ...prev,
                calories: prev.calories + result.nutrition.calories,
                protein: prev.protein + result.nutrition.protein,
                carbs: prev.carbs + result.nutrition.carbs,
                fats: prev.fats + result.nutrition.fats,
            }));

            setView('RESULT');
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
            setView('ERROR');
        }
    }, [userProfile, scanHistory, language]);
    
    const handleCapture = (imageData: string, mimeType: string) => {
        performAnalysis(imageData, mimeType, scanMode);
    };

    const resetView = () => {
        setView('HOME');
        setScanMode(null);
        setAnalysisResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePageChange = (page: Page) => {
        setActivePage(page);
        setIsMobileMenuOpen(false); // Close mobile menu on nav
        if (page === 'DASHBOARD') {
            resetView();
        }
    };
    
    const renderMainContent = () => {
        if (activePage === 'PROGRESS') return <TrackProgressPage />;
        if (activePage === 'HISTORY') return <HistoryPage history={scanHistory} />;
        if (activePage === 'MEAL_PLAN') return <MealPlanPage userProfile={userProfile} />;
        if (activePage === 'WORKOUTS') return <WorkoutPage userProfile={userProfile} />;
        if (activePage === 'WELLNESS') return <WellnessPage moodHistory={moodHistory} setMoodHistory={setMoodHistory} />;
        if (activePage === 'COMMUNITY') return <CommunityPage />;
        if (activePage === 'CONSULTATIONS') return <ConsultationsPage />;

        switch (view) {
            case 'HOME':
                return (
                    <div className="text-center p-4">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('helloName', { name: userProfile.name.split(' ')[0] })}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('readyToTrack')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <button onClick={() => handleScanStart('food')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all space-y-3">
                                <CameraIcon className="w-12 h-12 text-primary-500" />
                                <span className="text-lg font-semibold">{t('scanFood')}</span>
                            </button>
                             <button onClick={() => handleScanStart('qr')} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all space-y-3">
                                <QrCodeIcon className="w-12 h-12 text-primary-500" />
                                <span className="text-lg font-semibold">{t('scanQrBarcode')}</span>
                            </button>
                             <button onClick={handleUploadClick} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all space-y-3">
                                <UploadIcon className="w-12 h-12 text-primary-500" />
                                <span className="text-lg font-semibold">{t('uploadImage')}</span>
                            </button>
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                        <div className="mt-12 max-w-4xl mx-auto">
                             <h3 className="text-2xl font-bold mb-4">{t('dailyProgress')}</h3>
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <ProgressCircle value={dailyProgress.calories} maxValue={2000} label={t('calories')} color="text-red-500" unit="kcal" />
                                <ProgressCircle value={dailyProgress.protein} maxValue={100} label={t('protein')} color="text-blue-500" unit="g" />
                                <ProgressCircle value={dailyProgress.carbs} maxValue={250} label={t('carbs')} color="text-yellow-500" unit="g" />
                                <ProgressCircle value={dailyProgress.fats} maxValue={70} label={t('fats')} color="text-purple-500" unit="g" />
                                <WaterIntakeTracker progress={dailyProgress} setProgress={setDailyProgress} />
                             </div>
                        </div>
                    </div>
                );
            case 'SCANNING':
                return <CameraView onCapture={handleCapture} onCancel={resetView} scanMode={scanMode} />;
            case 'ANALYZING':
                return (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
                        <p className="text-lg">{t('analyzingFood')}</p>
                    </div>
                );
            case 'RESULT':
                return analysisResult ? <AnalysisResult result={analysisResult} onBack={resetView} /> : <div/>;
            case 'ERROR':
                 return (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-4">
                        <XCircleIcon className="w-16 h-16 text-red-500" />
                        <h3 className="text-2xl font-bold">{t('analysisFailed')}</h3>
                        <p className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg max-w-md">{error}</p>
                        <button onClick={resetView} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold">{t('tryAgain')}</button>
                    </div>
                 );
        }
    }
    
    return (
        <div className="flex flex-col h-screen">
             <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                <SidebarNav activePage={activePage} onPageChange={handlePageChange} isCollapsed={false} t={t} />
            </MobileSidebar>

            <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30 border-b dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="sm:hidden p-1 -ml-1 text-gray-600 dark:text-gray-300">
                         <MenuIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">NutriScan AI</h1>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <LanguageSelector />
                    <ThemeToggle />
                    <UserMenu userProfile={userProfile} onLogout={onLogout} />
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden min-h-0">
                <aside className={`transition-all duration-300 bg-white dark:bg-gray-800 border-r dark:border-gray-700 hidden sm:flex flex-col ${isSidebarCollapsed ? 'w-20 p-2' : 'w-56 p-4'}`}>
                    <div className="flex-1">
                        <SidebarNav activePage={activePage} onPageChange={handlePageChange} isCollapsed={isSidebarCollapsed} t={t} />
                    </div>
                     <div className="mt-auto pt-4 border-t dark:border-gray-700">
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                            className={`flex items-center w-full p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                            <span className={`ml-3 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : ''}`}>Collapse</span>
                        </button>
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                   {renderMainContent()}
                </main>
            </div>
            <Chatbot userProfile={userProfile} />
        </div>
    );
};

export default Dashboard;
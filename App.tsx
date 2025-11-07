
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { AuthStatus, UserProfile } from './types';

// 1. I18N Setup: Translations, Context, Provider, and Hook

const translations = {
  en: {
    // Auth
    welcomeBack: "Welcome Back!",
    createYourAccount: "Create Your Account",
    resetPassword: "Reset Password",
    login: "Login",
    signUp: "Sign Up",
    sendResetLink: "Send Reset Link",
    emailAddress: "Email address",
    password: "Password",
    forgotPassword: "Forgot your password?",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    rememberedPassword: "Remembered your password?",
    verificationEmailSent: "Verification email sent! Please check your inbox.",
    passwordResetLinkSent: "Password reset link sent to your email.",
    // Onboarding
    tellUsAboutYourself: "Tell Us About Yourself",
    personalizeExperience: "This helps us personalize your experience.",
    name: "Name",
    age: "Age",
    gender: "Gender",
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    professionActivityLevel: "Profession/Activity Level",
    dietaryPreference: "Dietary Preference",
    primaryGoal: "Primary Goal",
    saveAndContinue: "Save & Continue",
    nameRequired: "Name is required",
    ageRequired: "Age is required",
    genderRequired: "Gender is required",
    heightRequired: "Height is required",
    weightRequired: "Weight is required",
    professionRequired: "Profession is required",
    // Dashboard
    helloName: "Hello, {{name}}!",
    readyToTrack: "Ready to track your nutrition?",
    scanFood: "Scan Food",
    scanQrBarcode: "Scan QR/Barcode",
    uploadImage: "Upload Image",
    dailyProgress: "Daily Progress",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    waterIntake: "Water Intake",
    waterGoal: "Goal: {{goal}}ml",
    // Sidebar
    dashboard: "Dashboard",
    mealPlan: "Meal Plan",
    workouts: "Workouts",
    wellness: "Wellness",
    trackProgress: "Track Progress",
    history: "History",
    community: "Community",
    consultExperts: "Consult Experts",
    // User Menu
    editProfile: "Edit Profile",
    settings: "Settings",
    logout: "Logout",
    // Analysis
    analyzingFood: "Analyzing your food...",
    analysisFailed: "Analysis Failed",
    tryAgain: "Try Again",
    shouldEat: "Should Eat",
    moderate: "Moderate",
    avoid: "Avoid",
    suggestedServingSize: "Suggested Serving Size",
    scanAnotherItem: "Scan Another Item",
    // Pages
    scanHistory: "Scan History",
    searchHistory: "Search history...",
    noHistory: "No history yet. Start scanning!",
    yourWeeklyMealPlan: "Your Weekly Meal Plan",
    generateNewWeeklyPlan: "Generate New Weekly Plan",
    generateShoppingList: "Generate Shopping List",
    generatingPlan: "Generating Plan...",
    generatingList: "Generating List...",
    shoppingList: "Shopping List",
    yourWeeklyWorkoutPlan: "Your Weekly Workout Plan",
    generateNewWorkoutPlan: "Generate New Workout Plan",
    mentalWellnessCorner: "Mental Wellness Corner",
    howAreYouFeeling: "How are you feeling today?",
    addANote: "Add a note... (optional)",
    logMood: "Log Mood",
    yourMoodHistory: "Your Mood History",
    guidedMeditation: "Guided Meditation & Breathing",
    comingSoon: "Coming soon! A library of audio sessions to help you relax, focus, and find your calm.",
    communityFeed: "Community Feed",
    premiumFeature: "PREMIUM FEATURE",
    bookExpertConsultations: "Book 1-on-1 Expert Consultations",
    upgradeToPremium: "Upgrade to Premium",
    // Chatbot
    nutriScanAssistant: "NutriScan Assistant",
    howCanIHelp: "Hello, {{name}}! How can I help you with NutriScan AI today?",
    chatUnavailable: "Sorry, the chat assistant is currently unavailable.",
    tryAgainLater: "Sorry, I had trouble connecting. Please try again.",
    tryOneOfThese: "Or try one of these:",
    askAQuestion: "Ask a question...",
    faqScanFood: "How do I scan food?",
    faqMealPlan: "How does meal planning work?",
    faqWorkout: "Explain the workout generator.",
    faqRecommendation: "What does 'Should Eat' mean?",
  },
  hi: {
    // Auth
    welcomeBack: "वापसी पर स्वागत है!",
    createYourAccount: "अपना खाता बनाएं",
    resetPassword: "पासवर्ड रीसेट करें",
    login: "लॉग इन करें",
    signUp: "साइन अप करें",
    sendResetLink: "रीसेट लिंक भेजें",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    forgotPassword: "अपना पासवर्ड भूल गए?",
    dontHaveAccount: "खाता नहीं है?",
    alreadyHaveAccount: "पहले से ही एक खाता है?",
    rememberedPassword: "अपना पासवर्ड याद है?",
    verificationEmailSent: "सत्यापन ईमेल भेजा गया! कृपया अपना इनबॉक्स जांचें।",
    passwordResetLinkSent: "पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया है।",
    // Onboarding
    tellUsAboutYourself: "हमें अपने बारे में बताएं",
    personalizeExperience: "यह हमें आपके अनुभव को व्यक्तिगत बनाने में मदद करता है।",
    name: "नाम",
    age: "आयु",
    gender: "लिंग",
    heightCm: "ऊंचाई (सेमी)",
    weightKg: "वजन (किग्रा)",
    professionActivityLevel: "पेशा/गतिविधि स्तर",
    dietaryPreference: "आहार वरीयता",
    primaryGoal: "प्राथमिक लक्ष्य",
    saveAndContinue: "सहेजें और जारी रखें",
    nameRequired: "नाम आवश्यक है",
    ageRequired: "आयु आवश्यक है",
    genderRequired: "लिंग आवश्यक है",
    heightRequired: "ऊंचाई आवश्यक है",
    weightRequired: "वजन आवश्यक है",
    professionRequired: "पेशा आवश्यक है",
    // Dashboard
    helloName: "नमस्ते, {{name}}!",
    readyToTrack: "क्या आप अपने पोषण को ट्रैक करने के लिए तैयार हैं?",
    scanFood: "भोजन स्कैन करें",
    scanQrBarcode: "क्यूआर/बारकोड स्कैन करें",
    uploadImage: "छवि अपलोड करें",
    dailyProgress: "दैनिक प्रगति",
    calories: "कैलोरी",
    protein: "प्रोटीन",
    carbs: "कार्ब्स",
    fats: "वसा",
    waterIntake: "पानी का सेवन",
    waterGoal: "लक्ष्य: {{goal}} मिली",
    // Sidebar
    dashboard: "डैशबोर्ड",
    mealPlan: "भोजन योजना",
    workouts: "वर्कआउट",
    wellness: "कल्याण",
    trackProgress: "प्रगति ट्रैक करें",
    history: "इतिहास",
    community: "समुदाय",
    consultExperts: "विशेषज्ञों से परामर्श करें",
    // User Menu
    editProfile: "प्रोफ़ाइल संपादित करें",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
    // Analysis
    analyzingFood: "आपके भोजन का विश्लेषण किया जा रहा है...",
    analysisFailed: "विश्लेषण विफल",
    tryAgain: "पुनः प्रयास करें",
    shouldEat: "खाना चाहिए",
    moderate: "संयम में खाएं",
    avoid: "खाने से बचें",
    suggestedServingSize: "सुझाई गई सर्विंग साइज",
    scanAnotherItem: "दूसरा आइटम स्कैन करें",
    // Pages
    scanHistory: "स्कैन इतिहास",
    searchHistory: "इतिहास खोजें...",
    noHistory: "अभी तक कोई इतिहास नहीं है। स्कैनिंग शुरू करें!",
    yourWeeklyMealPlan: "आपकी साप्ताहिक भोजन योजना",
    generateNewWeeklyPlan: "नई साप्ताहिक योजना बनाएं",
    generateShoppingList: "खरीदारी की सूची बनाएं",
    generatingPlan: "योजना बना रहा है...",
    generatingList: "सूची बना रहा है...",
    shoppingList: "खरीदारी की सूची",
    yourWeeklyWorkoutPlan: "आपकी साप्ताहिक कसरत योजना",
    generateNewWorkoutPlan: "नई कसरत योजना बनाएं",
    mentalWellnessCorner: "मानसिक कल्याण कोना",
    howAreYouFeeling: "आज आप कैसा महसूस कर रहे हैं?",
    addANote: "एक नोट जोड़ें... (वैकल्पिक)",
    logMood: "मूड लॉग करें",
    yourMoodHistory: "आपका मूड इतिहास",
    guidedMeditation: "निर्देशित ध्यान और श्वास",
    comingSoon: "जल्द आ रहा है! आपको आराम करने, ध्यान केंद्रित करने और अपनी शांति पाने में मदद करने के लिए ऑडियो सत्रों की एक लाइब्रेरी।",
    communityFeed: "सामुदायिक फ़ीड",
    premiumFeature: "प्रीमियम सुविधा",
    bookExpertConsultations: "विशेषज्ञों के साथ 1-पर-1 परामर्श बुक करें",
    upgradeToPremium: "प्रीमियम में अपग्रेड करें",
    // Chatbot
    nutriScanAssistant: "न्यूट्रिशन असिस्टेंट",
    howCanIHelp: "नमस्ते, {{name}}! मैं आज न्यूट्रिशन एआई में आपकी कैसे मदद कर सकता हूँ?",
    chatUnavailable: "क्षमा करें, चैट सहायक वर्तमान में अनुपलब्ध है।",
    tryAgainLater: "क्षमा करें, मुझे कनेक्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।",
    tryOneOfThese: "या इनमें से कोई एक आज़माएँ:",
    askAQuestion: "एक सवाल पूछें...",
    faqScanFood: "मैं भोजन कैसे स्कैन करूं?",
    faqMealPlan: "भोजन योजना कैसे काम करती है?",
    faqWorkout: "वर्कआउट जेनरेटर समझाएं।",
    faqRecommendation: "'खाना चाहिए' का क्या मतलब है?",
  }
};

type Language = 'en' | 'hi';
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key: keyof typeof translations.en, options?: { [key: string]: string | number }) => {
    let translation = translations[language][key] || key;
    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(new RegExp(`{{${optKey}}}`, 'g'), String(options[optKey]));
      });
    }
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


const App: React.FC = () => {
    const [authStatus, setAuthStatus] = useState<AuthStatus>(() => (localStorage.getItem('authStatus') as AuthStatus) || 'LOGGED_OUT');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        const storedProfile = localStorage.getItem('userProfile');
        return storedProfile ? JSON.parse(storedProfile) : null;
    });

    useEffect(() => {
        localStorage.setItem('authStatus', authStatus);
        if (userProfile) {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } else {
            localStorage.removeItem('userProfile');
        }
    }, [authStatus, userProfile]);

    const handleLoginSuccess = useCallback(() => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
            setAuthStatus('LOGGED_IN');
        } else {
            setAuthStatus('ONBOARDING');
        }
    }, []);
    
    const handleOnboardingComplete = useCallback((profile: UserProfile) => {
        setUserProfile(profile);
        setAuthStatus('LOGGED_IN');
    }, []);

    const handleLogout = useCallback(() => {
        setAuthStatus('LOGGED_OUT');
    }, []);

    const renderContent = () => {
        switch (authStatus) {
            case 'LOGGED_OUT':
                return <Auth onLoginSuccess={handleLoginSuccess} />;
            case 'ONBOARDING':
                return <Onboarding onOnboardingComplete={handleOnboardingComplete} />;
            case 'LOGGED_IN':
                if (userProfile) {
                    return <Dashboard userProfile={userProfile} onLogout={handleLogout} />;
                }
                setAuthStatus('LOGGED_OUT');
                return <Auth onLoginSuccess={handleLoginSuccess} />;
            default:
                return <Auth onLoginSuccess={handleLoginSuccess} />;
        }
    };

    return (
        <LanguageProvider>
            <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                {renderContent()}
            </div>
        </LanguageProvider>
    );
};

export default App;

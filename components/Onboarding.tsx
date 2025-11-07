
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../App';

interface OnboardingProps {
    onOnboardingComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onOnboardingComplete }) => {
    const { t } = useLanguage();
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        dietaryPreference: 'Non-Vegetarian',
        primaryGoal: { type: 'Fitness', detail: 'Weight Loss' }
    });
    
    const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    
    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            primaryGoal: {
                ...(prev.primaryGoal || { type: 'Fitness', detail: '' }),
                [name]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic Validation
        const newErrors: Partial<Record<keyof UserProfile, string>> = {};
        if (!profile.name) newErrors.name = t('nameRequired');
        if (!profile.age) newErrors.age = t('ageRequired');
        if (!profile.gender) newErrors.gender = t('genderRequired');
        if (!profile.height) newErrors.height = t('heightRequired');
        if (!profile.weight) newErrors.weight = t('weightRequired');
        if (!profile.profession) newErrors.profession = t('professionRequired');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onOnboardingComplete(profile as UserProfile);
    };

    const renderOptions = (start: number, end: number) => {
        let options = [];
        for (let i = start; i <= end; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    };

    const genderOptions = [
        { value: 'Male', label: t('male') },
        { value: 'Female', label: t('female') },
        { value: 'Other', label: t('other') },
        { value: 'Prefer not to say', label: t('preferNotToSay') }
    ];

    const professionOptions = [
        { value: "Sedentary (office job)", label: t('professionSedentary') },
        { value: "Lightly Active (light exercise 1-3 days/week)", label: t('professionLightlyActive') },
        { value: "Moderately Active (moderate exercise 3-5 days/week)", label: t('professionModeratelyActive') },
        { value: "Very Active (hard exercise 6-7 days/week)", label: t('professionVeryActive') },
        { value: "Other", label: t('professionOther') },
    ];

    const medicalGoalOptions = [
        { value: "Diabetes", label: t('goalDiabetes') },
        { value: "Hypertension", label: t('goalHypertension') },
        { value: "PCOS", label: t('goalPCOS') },
        { value: "Custom", label: t('goalCustom') },
    ];

    const fitnessGoalOptions = [
        { value: "Weight Loss", label: t('goalWeightLoss') },
        { value: "Muscle Gain", label: t('goalMuscleGain') },
        { value: "Maintenance", label: t('goalMaintenance') },
        { value: "Custom", label: t('goalCustom') },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400">{t('tellUsAboutYourself')}</h2>
                <p className="text-center text-gray-600 dark:text-gray-400">{t('personalizeExperience')}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')}</label>
                            <input type="text" name="name" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('age')}</label>
                            <select name="age" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{t('selectAge')}</option>
                                {renderOptions(13, 100)}
                            </select>
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>
                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('gender')}</label>
                            <select name="gender" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{t('selectGender')}</option>
                                {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('heightCm')}</label>
                            <select name="height" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{t('selectHeight')}</option>
                                {renderOptions(120, 220)}
                            </select>
                            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                        </div>
                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('weightKg')}</label>
                            <select name="weight" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{t('selectWeight')}</option>
                                {renderOptions(30, 200)}
                            </select>
                             {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                        </div>
                        {/* Profession */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('professionActivityLevel')}</label>
                            <select name="profession" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{t('selectOne')}</option>
                                {professionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
                        </div>
                        {profile.profession === 'Other' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customProfession')}</label>
                                <input type="text" name="customProfession" onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        )}
                    </div>
                    
                    {/* Dietary Preference */}
                    <div className="pt-4 border-t dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dietaryPreference')}</label>
                        <div className="mt-2 flex items-center space-x-4">
                           <label className="flex items-center">
                                <input type="radio" name="dietaryPreference" value="Vegetarian" onChange={handleChange} checked={profile.dietaryPreference === 'Vegetarian'} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('vegetarian')}</span>
                           </label>
                            <label className="flex items-center">
                                <input type="radio" name="dietaryPreference" value="Non-Vegetarian" onChange={handleChange} checked={profile.dietaryPreference === 'Non-Vegetarian'} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('nonVegetarian')}</span>
                           </label>
                        </div>
                    </div>

                    {/* Primary Goal */}
                    <div className="pt-4 border-t dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('primaryGoal')}</label>
                         <div className="mt-2 flex items-center space-x-4">
                           <label className="flex items-center">
                                <input type="radio" name="type" value="Medical" onChange={handleGoalChange} checked={profile.primaryGoal?.type === 'Medical'} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('medicalManagement')}</span>
                           </label>
                            <label className="flex items-center">
                                <input type="radio" name="type" value="Fitness" onChange={handleGoalChange} checked={profile.primaryGoal?.type === 'Fitness'} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('fitnessGoal')}</span>
                           </label>
                        </div>
                        
                        {profile.primaryGoal?.type === 'Medical' && (
                            <div className="mt-4">
                               <select name="detail" onChange={handleGoalChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                    {medicalGoalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                               </select>
                               {profile.primaryGoal?.detail === 'Custom' && <input type="text" name="customDetail" placeholder={t('specifyCondition')} onChange={handleGoalChange} className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />}
                            </div>
                        )}
                         {profile.primaryGoal?.type === 'Fitness' && (
                            <div className="mt-4">
                               <select name="detail" defaultValue="Weight Loss" onChange={handleGoalChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                    {fitnessGoalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                               </select>
                               {profile.primaryGoal?.detail === 'Custom' && <input type="text" name="customDetail" placeholder={t('specifyGoal')} onChange={handleGoalChange} className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />}
                            </div>
                        )}
                    </div>
                    
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800">{t('saveAndContinue')}</button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;

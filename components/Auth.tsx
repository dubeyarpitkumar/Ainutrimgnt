
import React, { useState, useEffect, useRef } from 'react';
import { AuthView } from '../types';
import { useLanguage } from '../App';
import { SunIcon, MoonIcon, LanguageIcon } from './Icons';

// Helper: Theme Toggle (Copied for use in Auth screen)
const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (localStorage.getItem('theme') === 'dark') return true;
        if (localStorage.getItem('theme') === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

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
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );
};

// Helper: Language Selector (Copied for use in Auth screen)
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
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                <LanguageIcon className="w-6 h-6" />
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


interface AuthProps {
    onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const { t } = useLanguage();
    const [authView, setAuthView] = useState<AuthView>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        // This is a mock authentication
        if (email && password) {
            if (authView === 'LOGIN') {
                console.log('Logging in...');
                onLoginSuccess();
            } else if (authView === 'SIGNUP') {
                console.log('Signing up...');
                setMessage(t('verificationEmailSent'));
                setTimeout(() => setAuthView('LOGIN'), 3000);
            }
        } else if (email && authView === 'RESET') {
             console.log('Resetting password...');
             setMessage(t('passwordResetLinkSent'));
             setTimeout(() => setAuthView('LOGIN'), 3000);
        }
    };

    const getTitle = () => {
        switch (authView) {
            case 'LOGIN': return t('welcomeBack');
            case 'SIGNUP': return t('createYourAccount');
            case 'RESET': return t('resetPassword');
        }
    };
    
    const getButtonText = () => {
        switch (authView) {
            case 'LOGIN': return t('login');
            case 'SIGNUP': return t('signUp');
            case 'RESET': return t('sendResetLink');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="relative w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="absolute top-4 right-4 flex items-center space-x-1">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
                <div className="text-center pt-8">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">NutriScan AI</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{getTitle()}</p>
                </div>

                {message && (
                    <div className="p-4 text-center text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg">
                        {message}
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                         <div>
                            <label htmlFor="email-address" className="sr-only">{t('emailAddress')}</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder={t('emailAddress')}
                            />
                        </div>
                        {authView !== 'RESET' && (
                            <div>
                                <label htmlFor="password" className="sr-only">{t('password')}</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder={t('password')}
                                />
                            </div>
                        )}
                    </div>

                    {authView === 'LOGIN' && (
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <button type="button" onClick={() => setAuthView('RESET')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                    {t('forgotPassword')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <button type="submit" className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800">
                            {getButtonText()}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    {authView === 'LOGIN' && (
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('dontHaveAccount')}{' '}
                            <button onClick={() => setAuthView('SIGNUP')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                {t('signUp')}
                            </button>
                        </p>
                    )}
                    {authView === 'SIGNUP' && (
                         <p className="text-gray-600 dark:text-gray-400">
                            {t('alreadyHaveAccount')}{' '}
                            <button onClick={() => setAuthView('LOGIN')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                {t('login')}
                            </button>
                        </p>
                    )}
                     {authView === 'RESET' && (
                         <p className="text-gray-600 dark:text-gray-400">
                            {t('rememberedPassword')}{' '}
                            <button onClick={() => setAuthView('LOGIN')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                {t('login')}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;

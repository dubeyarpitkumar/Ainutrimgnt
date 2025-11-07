
import React, { useState } from 'react';
import { AuthView } from '../types';
import { useLanguage } from '../App';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="text-center">
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

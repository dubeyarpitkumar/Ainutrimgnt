import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MessageCircleIcon, XIcon, SparklesIcon } from './Icons';
import { UserProfile } from '../types';

interface ChatbotProps {
    userProfile: UserProfile;
}

interface Message {
    role: 'user' | 'model';
    content: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ userProfile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && !chat) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: `You are a friendly and helpful AI assistant for NutriScan AI, a nutrition tracking app. The user's name is ${userProfile.name}. Address them by their name occasionally. Your role is to answer user questions about the app's features. Keep your answers concise, helpful, and encouraging. Do not answer questions unrelated to health, fitness, or the NutriScan AI app.`,
                    },
                });
                setChat(chatSession);
                setMessages([
                    { role: 'model', content: `Hello ${userProfile.name.split(' ')[0]}! How can I help you with NutriScan AI today?` }
                ]);
            } catch (error) {
                console.error("Failed to initialize chatbot:", error);
                 setMessages([
                    { role: 'model', content: "Sorry, the chat assistant is currently unavailable." }
                ]);
            }
        }
    }, [isOpen, chat, userProfile.name]);

    const handleSend = async (messageText?: string) => {
        const text = (messageText || input).trim();
        if (!text || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: text });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                modelResponse += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                // remove the empty model message placeholder
                if (newMessages[newMessages.length-1].content === '') {
                    newMessages.pop();
                }
                return [...newMessages, { role: 'model', content: 'Sorry, I had trouble connecting. Please try again.' }];
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    const faqs = [
        "How do I scan food?",
        "How does meal planning work?",
        "Explain the workout generator.",
        "What does 'Should Eat' mean?",
    ];

    return (
        <>
            <div className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <SparklesIcon className="w-6 h-6 text-primary-500" />
                        <h3 className="font-bold text-lg">NutriScan Assistant</h3>
                    </div>
                     <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-lg'}`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-lg">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* FAQs */}
                {messages.length <= 2 && (
                    <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                         <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or try one of these:</p>
                        <div className="flex flex-wrap gap-2">
                            {faqs.map(faq => (
                                <button key={faq} onClick={() => handleSend(faq)} disabled={isLoading} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
                                    {faq}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                    <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-primary-300 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-4 sm:right-6 w-16 h-16 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-transform transform hover:scale-110 z-50" aria-label={isOpen ? "Close chat" : "Open chat"}>
                {isOpen ? <XIcon className="w-8 h-8" /> : <MessageCircleIcon className="w-8 h-8" />}
            </button>
        </>
    );
};

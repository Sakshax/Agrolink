import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function TopAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();

  const isQuizPage = location.pathname.startsWith('/learn/');

  const getTitle = () => {
    if (location.pathname.startsWith('/courses')) return t('Siksha', 'शिक्षा');
    if (location.pathname.startsWith('/jobs'))    return t('Rozgar', 'रोजगार');
    if (location.pathname.startsWith('/profile')) return t('My Profile', 'प्रोफाइल');
    if (isQuizPage) return t('Module', 'मॉड्यूल');
    return t('Siksha & Rozgar', 'शिक्षा और रोजगार');
  };

  return (
    <div className="bg-primary-green text-white p-4 sticky top-0 z-30 w-full shadow-md flex items-center gap-3">
      {isQuizPage && (
        <button
          onClick={() => navigate('/courses')}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors active:scale-95 flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold truncate leading-tight">{getTitle()}</h1>
        <p className="text-[12px] opacity-80 font-medium">{t('Empowering your future', 'आपके भविष्य के लिए सशक्तिकरण')}</p>
      </div>

      <button
        onClick={toggleLang}
        className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center gap-1 hover:bg-white/25 transition-colors active:scale-95 flex-shrink-0"
        title="Toggle Language"
      >
        <span className="font-bold text-[13px] leading-none">{lang === 'en' ? 'A' : 'अ'}</span>
        <Languages size={14} className="opacity-75" />
      </button>
    </div>
  );
}

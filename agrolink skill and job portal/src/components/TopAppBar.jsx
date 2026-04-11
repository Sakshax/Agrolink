import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function TopAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();

  const isQuizPage = location.pathname.startsWith('/learn/');
  const isMarketplaceSubpage = ['/listing/', '/checkout/', '/tracking/', '/create-listing', '/mandi-dashboard', '/mandi-admin', '/mandi-auth', '/orders'].some(
    p => location.pathname.startsWith(p)
  );

  const getTitle = () => {
    if (location.pathname.startsWith('/courses')) return t('Siksha', 'शिक्षा');
    if (location.pathname.startsWith('/jobs'))    return t('Rozgar', 'रोजगार');
    if (location.pathname.startsWith('/profile')) return t('My Profile', 'प्रोफाइल');
    if (isQuizPage) return t('Module', 'मॉड्यूल');
    if (location.pathname.startsWith('/marketplace')) return t('Digital Mandi', 'डिजिटल मंडी');
    if (location.pathname.startsWith('/mandi-dashboard')) return t('Farmer Hub', 'किसान हब');
    if (location.pathname.startsWith('/create-listing')) return t('List Your Crop', 'फसल सूचीबद्ध करें');
    if (location.pathname.startsWith('/listing/')) return t('Crop Details', 'फसल विवरण');
    if (location.pathname.startsWith('/checkout/')) return t('Confirm Order', 'ऑर्डर पुष्टि');
    if (location.pathname.startsWith('/orders')) return t('My Orders', 'मेरे ऑर्डर');
    if (location.pathname.startsWith('/tracking/')) return t('Track Order', 'ऑर्डर ट्रैक');
    if (location.pathname.startsWith('/mandi-auth')) return t('Mandi Login', 'मंडी लॉगइन');
    if (location.pathname.startsWith('/mandi-admin')) return t('Admin Hub', 'एडमिन हब');
    return t('Siksha & Rozgar', 'शिक्षा और रोजगार');
  };

  // Hide top bar on marketplace full-page routes that have their own headers
  if (isMarketplaceSubpage) return null;

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


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          marketplace: 'Digital Mandi',
          dashboard: 'Farmer Hub',
          profile: 'My Profile',
          search_placeholder: 'Search crops, markets...',
          filters: {
            all: 'All Crops',
            near: 'Near Me',
            best: 'Best Rated',
            fair: 'Fair Price'
          },
          badges: {
            active: 'ACTIVE LISTING',
            fair: 'FAIR PRICE',
            high: 'HIGH PRICE'
          },
          list_crop: 'List Your Crop',
          farmer_name: 'Farmer Name',
          asking_price: 'Asking Price',
          mandi_benchmark: 'Mandi Benchmark',
          buy_now: 'Buy Now',
          weight_label: 'Approx Weight (Quintals)',
          price_label: 'Asking Price (₹/Qtl)',
          location_detected: 'Current Location Detected',
          publish_btn: 'PUBLISH LISTING',
          tap_mic: 'Tap mic to say price in Hindi',
          loading_data: 'Fetching live mandi data...',
          per_quintal: 'per quintal'
        }
      },
      hi: {
        translation: {
          marketplace: 'डिजिटल मंडी',
          dashboard: 'किसान हब',
          profile: 'मेरी प्रोफाइल',
          search_placeholder: 'फसल या मंडी खोजें...',
          filters: {
            all: 'सभी फसलें',
            near: 'मेरे पास',
            best: 'सबसे अच्छी रेटिंग',
            fair: 'उचित मूल्य'
          },
          badges: {
            active: 'सक्रिय सूची',
            fair: 'उचित मूल्य',
            high: 'उच्च मूल्य'
          },
          list_crop: 'अपनी फसल की सूची बनाएं',
          farmer_name: 'किसान का नाम',
          asking_price: 'आपकी कीमत',
          mandi_benchmark: 'मंडी बेंचमार्क',
          buy_now: 'अभी खरीदें',
          weight_label: 'अनुमानित वजन (क्विंटल)',
          price_label: 'मांगी गई कीमत (₹/क्विंटल)',
          location_detected: 'वर्तमान स्थान मिला',
          publish_btn: 'सूची प्रकाशित करें',
          tap_mic: 'हिंदी में कीमत बताने के लिए माइक टैप करें',
          loading_data: 'लाइव मंडी डेटा प्राप्त कर रहे हैं...',
          per_quintal: 'प्रति क्विंटल'
        }
      }
    }
  });

export default i18n;

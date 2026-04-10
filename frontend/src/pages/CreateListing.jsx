import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ArrowLeft, Mic, MicOff, MapPin, Loader2, Image as ImageIcon, TrendingUp, CheckCircle } from 'lucide-react';

const CreateListing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    quantity: '',
    price: '',
    location: 'Punjab, India'
  });

  // Web Speech API Setup — safe even when browser doesn't support it
  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

  let recognition = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const numericValue = transcript.replace(/[^0-9]/g, '');
      if (numericValue) {
        setFormData(prev => ({ ...prev, price: numericValue }));
      }
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleVoice = () => {
    if (!recognition) return alert('Speech recognition not supported in this browser');
    if (isListening) { recognition.stop(); }
    else { setIsListening(true); recognition.start(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantity || !formData.price) {
      alert('Please fill in quantity and price');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/listings', {
        ...formData,
        farmerId: 'demo_user',
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price)
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to create listing. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Crop Listed!</h2>
        <p className="text-sm text-gray-400 font-bold">Your {formData.cropName} is now visible in the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-4 font-sans max-w-lg mx-auto pb-28">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold font-sans text-gray-900">{t('list_crop')}</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-primary/5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl text-primary mb-4">
            <TrendingUp className="w-5 h-5" />
            <p className="text-xs font-bold leading-none">Agmarknet Live Mandi Link Active</p>
          </div>

          {/* Crop selector */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Crop</label>
            <div className="grid grid-cols-3 gap-2">
              {['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Potato'].map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => setFormData({ ...formData, cropName: crop })}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${formData.cropName === crop
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {t('weight_label')}
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-lg font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          {/* Price with voice */}
          <div className="space-y-1 relative">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {t('price_label')}
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 2100"
                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 py-2 text-lg font-bold outline-none focus:ring-4 ring-primary/10 transition-all pr-14"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <button
                type="button"
                onClick={toggleVoice}
                className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-primary/10 text-primary'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1">
              <Mic className="w-3 h-3" /> {t('tap_mic')}
            </p>
          </div>
        </div>

        {/* Photo + Location */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-primary/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Add Crop Photo</p>
              <p className="text-xs text-gray-400">Clear photos help you sell faster</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
            <MapPin className="text-primary w-5 h-5" />
            <div className="text-xs">
              <p className="font-bold text-gray-900">{t('location_detected')}</p>
              <p className="text-gray-500">{formData.location}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-primary text-white font-black text-lg rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('publish_btn')}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;

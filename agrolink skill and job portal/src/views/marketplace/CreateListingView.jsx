import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { ArrowLeft, Mic, MicOff, MapPin, Loader2, TrendingUp, CheckCircle, Navigation } from 'lucide-react';
import { getCropImage } from '../../utils/cropImages';
import { motion, AnimatePresence } from 'framer-motion';

const CreateListingView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    quantity: '',
    price: '',
    location: 'Punjab, India'
  });

  const availableCrops = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Potato'];

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
      await addDoc(collection(db, 'listings'), {
        ...formData,
        farmerId: user?._id || 'demo_user',
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => navigate('/mandi-dashboard'), 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to create listing check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
           initial={{ scale: 0 }} 
           animate={{ scale: 1 }} 
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
          <CheckCircle className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl font-black text-white mb-2 tracking-wide">
          Crop Listed!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-white/80 font-bold">
          Your {formData.cropName} is now live on the marketplace.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 font-sans max-w-lg mx-auto pb-28">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/mandi-dashboard')} className="p-2 bg-white rounded-xl shadow-sm">
          <ArrowLeft className="w-6 h-6 text-charcoal" />
        </button>
        <div>
          <h1 className="text-2xl font-black font-sans text-charcoal leading-tight">{t('list_crop')}</h1>
          <p className="text-[10px] uppercase font-black tracking-widest text-charcoal/40">Marketplace Details</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
         {/* Live Market Notice */}
        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
          <TrendingUp className="w-6 h-6" />
          <p className="text-xs font-bold leading-tight">Agmarknet Live Mandi Link is active. Fair market prices will be suggested (demo).</p>
        </div>

        {/* Crop Selection UI */}
        <div className="bg-white p-5 rounded-[32px] box-border shadow-sm border border-light-gray space-y-4">
          <label className="block text-xs font-black text-charcoal uppercase tracking-widest">Select Crop</label>
          <div className="grid grid-cols-3 gap-3">
            {availableCrops.map(crop => {
              const isSelected = formData.cropName === crop;
              return (
                <button
                  key={crop}
                  type="button"
                  onClick={() => setFormData({ ...formData, cropName: crop })}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all overflow-hidden ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                      : 'border-transparent bg-light-gray/30 hover:bg-light-gray/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-10 h-10 mb-2 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-1">
                     <img src={getCropImage(crop)} alt={crop} className="w-full h-full object-contain drop-shadow" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-charcoal'}`}>{crop}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity & Price Panel */}
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-light-gray space-y-5">
           <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="block text-[10px] font-black text-charcoal/50 uppercase tracking-widest mb-1">
                  Total Weight (Qtl)
                </label>
                <div className="relative">
                   <input
                     type="number"
                     placeholder="0"
                     className="w-full h-14 bg-light-gray/30 border-none rounded-2xl px-5 text-xl font-black outline-none focus:ring-2 ring-primary/20 transition-all text-charcoal placeholder:text-charcoal/20"
                     value={formData.quantity}
                     onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                   />
                </div>
              </div>

              <div className="flex-1 space-y-1 relative">
                <label className="block text-[10px] font-black text-charcoal/50 uppercase tracking-widest mb-1 flex justify-between items-center">
                  Price / Qtl
                  <button type="button" onClick={toggleVoice} className={`p-1 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
                      {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-charcoal/40 text-xl">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full h-14 bg-light-gray/30 border-none rounded-2xl pl-9 pr-4 text-xl font-black outline-none focus:ring-2 ring-primary/20 transition-all text-charcoal placeholder:text-charcoal/20"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Location Display */}
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-light-gray relative overflow-hidden">
           {/* Faux map background effect */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
           
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner border border-primary/20">
                    <Navigation className="text-primary w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-charcoal/50 uppercase tracking-widest mb-0.5">Pickup Details</p>
                    <p className="text-sm font-black text-charcoal">{formData.location}</p>
                 </div>
              </div>
              <button type="button" className="text-[10px] text-primary font-black uppercase tracking-widest px-3 py-1.5 bg-primary/10 rounded-lg">GPS Active</button>
           </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-primary text-white font-black text-lg rounded-[24px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-95 disabled:opacity-50 tracking-wide mt-2"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('publish_btn')}
        </button>
      </form>
    </div>
  );
};

export default CreateListingView;

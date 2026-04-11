import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setFilters } from '../../store/slices/marketplaceSlice';
import { Search, Filter, MapPin, Star, History, Loader2, ArrowRight, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCropImage } from '../../utils/cropImages';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MarketplaceView = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filters } = useSelector((state) => state.marketplace);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [localSearch, setLocalSearch] = useState('');
  const [activeChip, setActiveChip] = useState('all');

  useEffect(() => {
    setStatus('loading');
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const fetchedData = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
       setItems(fetchedData);
       setStatus('succeeded');
    }, (error) => {
       console.error("Firebase listen error:", error);
       setStatus('failed');
    });

    return () => unsubscribe();
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const filteredItems = items.filter((listing) => {
    const q = localSearch.toLowerCase().trim();
    if (!q) return true;
    return listing.cropName.toLowerCase().includes(q);
  });

  const handleChipClick = (crop) => {
    setActiveChip(crop);
    if (crop === 'all') {
      setLocalSearch('');
    } else {
      setLocalSearch(crop);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans pb-32">
      {/* Sticky Premium Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-primary p-6 rounded-b-[40px] shadow-xl sticky top-0 z-40 transition-all"
      >
        <div className="flex justify-between items-center mb-6 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
             <h1 className="text-2xl font-black">{t('marketplace')}</h1>
             <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">AgroLink Digital Mandi</p>
          </motion.div>
          <div className="flex gap-2">
            <button 
              onClick={toggleLanguage}
              className="p-3 bg-white/10 rounded-2xl backdrop-blur-md flex items-center gap-2 text-[10px] font-bold hover:bg-white/20 transition-all"
            >
              <Languages className="w-5 h-5" /> {i18n.language.toUpperCase()}
            </button>
            <button className="p-3 bg-white/10 rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            className="w-full h-14 bg-white rounded-2xl pl-14 pr-4 text-charcoal font-bold outline-none focus:ring-4 ring-white/20 transition-all shadow-lg text-sm"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setActiveChip('all'); }}
          />
          <Search className="absolute left-5 top-4.5 w-5 h-5 text-charcoal/40" />
        </motion.div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Crop filter chips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 overflow-x-auto pb-4 no-scrollbar"
        >
           {['all', 'Wheat', 'Rice', 'Corn', 'Cotton', 'Soybean', 'Potato'].map((crop, i) => (
             <motion.button 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4 + (i * 0.05) }}
               key={crop}
               onClick={() => handleChipClick(crop)}
               className={`px-5 py-2.5 border rounded-full text-xs font-black whitespace-nowrap shadow-sm transition-all active:scale-95 ${
                 activeChip === crop
                   ? 'bg-primary text-white border-primary'
                   : 'bg-white text-charcoal/50 border-light-gray hover:bg-primary hover:text-white'
               }`}
             >
               {crop === 'all' ? t('filters.all') : crop}
             </motion.button>
           ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'loading' ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center py-20"
             >
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="font-bold text-charcoal/40">{t('loading_data')}</p>
             </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {filteredItems.map((listing, i) => {
                const isFairPrice = !listing.mandiPrice || listing.price <= listing.mandiPrice;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={listing._id} 
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-light-gray hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <Link to={`/listing/${listing._id}`}>
                      <div className="relative h-40 bg-light-gray overflow-hidden">
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          src={getCropImage(listing.cropName)} 
                          className="w-full h-full object-cover"
                          alt={listing.cropName}
                        />
                        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                           {t('badges.active')}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="p-4">
                       <h3 className="text-base font-black text-charcoal mb-1">{listing.cropName}</h3>
                       <div className="flex items-center gap-1 mb-3">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="text-[9px] font-bold text-charcoal/40">4.9 (12)</span>
                       </div>

                       <div className="flex items-baseline justify-between mb-3">
                          <p className="text-xl font-black text-primary">₹{listing.price}</p>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase">/Qtl</p>
                       </div>

                       {/* Mandi benchmark compact */}
                       <div className="bg-light-gray/50 p-2.5 rounded-xl flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <History className="w-3.5 h-3.5 text-primary" />
                             <span className="text-[9px] font-bold text-charcoal/50">Mandi ₹{listing.mandiPrice || '---'}</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${isFairPrice ? 'bg-green-100 text-primary' : 'bg-red-100 text-red-600'}`}>
                           {isFairPrice ? '✓ Fair' : '↑ High'}
                          </div>
                       </div>

                       <button 
                         onClick={(e) => { e.preventDefault(); navigate(`/checkout/${listing._id}`); }}
                         className="w-full h-11 bg-charcoal text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg active:scale-95"
                       >
                         Confirm Purchase
                       </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketplaceView;

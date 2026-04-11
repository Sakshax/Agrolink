import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Star, History, Phone, ShieldCheck, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCropImage } from '../../utils/cropImages';

const ListingDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings`);
      const item = response.data.find(l => l._id === id);
      setListing(item);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
       <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
       <p className="font-black text-charcoal/40 animate-pulse">{t('loading_data')}</p>
    </div>
  );

  if (!listing) return <div className="p-10 text-center font-bold">Listing not found</div>;

  const isFairPrice = !listing.mandiPrice || listing.price <= listing.mandiPrice;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream font-sans pb-32"
    >
      <div className="relative h-96 w-full bg-light-gray overflow-hidden">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 z-30 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-light-gray"
        >
          <ArrowLeft className="w-6 h-6 text-charcoal" />
        </motion.button>
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={getCropImage(listing.cropName)} 
          className="w-full h-full object-cover"
          alt={listing.cropName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        className="px-6 -mt-16 relative z-20"
      >
        <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-charcoal/5 border border-light-gray">
          <div className="flex justify-between items-start mb-6">
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-charcoal"
              >
                {listing.cropName}
              </motion.h1>
              <div className="flex items-center gap-2 mt-2 py-1 px-3 bg-primary/10 text-primary w-fit rounded-full text-[10px] font-black uppercase">
                 <ShieldCheck className="w-3 h-3" /> VERIFIED SELLER
              </div>
            </div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <p className="text-3xl font-black text-primary">₹{listing.price}</p>
              <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest leading-none">{t('per_quintal')}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <motion.div whileHover={{ y: -5 }} className="bg-light-gray/50 p-5 rounded-3xl border border-light-gray">
                <p className="text-[10px] font-bold text-charcoal/40 uppercase mb-1">{t('weight_label')}</p>
                <p className="text-xl font-black">{listing.quantity} Quintals</p>
             </motion.div>
             <motion.div whileHover={{ y: -5 }} className="bg-light-gray/50 p-5 rounded-3xl border border-light-gray">
                <p className="text-[10px] font-bold text-charcoal/40 uppercase mb-1">Mandi Hub</p>
                <p className="text-xl font-black">Amritsar</p>
             </motion.div>
          </div>

          <h3 className="text-lg font-black mb-4">Farmer Details</h3>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10 mb-8"
          >
             <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold border-2 border-white shadow-lg">
                {listing.farmerId?.name?.[0] || 'RS'}
             </div>
             <div className="flex-1">
                <p className="font-extrabold text-charcoal">{listing.farmerId?.name || 'Ramesh Singh'}</p>
                <div className="flex items-center gap-1">
                   {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-accent fill-accent" />)}
                   <span className="text-xs text-charcoal/40 font-bold ml-1">4.9 (12 reviews)</span>
                </div>
             </div>
             <motion.button 
               whileHover={{ rotate: 15 }}
               className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 active:scale-90 transition-all"
             >
                <Phone className="w-5 h-5" />
             </motion.button>
          </motion.div>

          <section className="mb-8">
            <h3 className="text-lg font-black mb-4">Mandi Reviews</h3>
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 bg-light-gray/50 rounded-3xl border border-light-gray"
              >
                <div className="flex gap-1 mb-2">
                   {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-accent fill-accent" />)}
                </div>
                <p className="text-sm font-bold text-charcoal leading-snug">"Superb quality rice. Delivery was timely. The moisture levels were perfect as described."</p>
                <p className="text-[10px] font-bold text-charcoal/40 mt-2 uppercase">— Arun Kumar, 2 days ago</p>
              </motion.div>
            </div>
          </section>

          <h3 className="text-lg font-black mb-4">{t('mandi_benchmark')}</h3>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-charcoal text-white p-7 rounded-[32px] overflow-hidden relative mb-8 shadow-2xl"
          >
             <div className="relative z-10 flex justify-between items-center">
                <div>
                   <p className="text-xs opacity-60 uppercase font-black mb-1">Live Mandi (Govt.)</p>
                   <p className="text-3xl font-black">₹{listing.mandiPrice || '---'}</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black border-2 ${isFairPrice ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}>
                   {isFairPrice ? t('badges.fair') : t('badges.high')}
                </div>
             </div>
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
          </motion.div>

          <motion.button 
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
           onClick={() => navigate(`/checkout/${listing._id}`)}
           className="w-full h-20 bg-primary text-white font-black text-xl rounded-[28px] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
             <ShoppingCart className="w-7 h-7" /> {t('buy_now')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ListingDetailView;

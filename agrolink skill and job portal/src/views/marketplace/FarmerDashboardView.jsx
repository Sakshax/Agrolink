import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { Plus, TrendingUp, Package, ArrowRight, Loader2, Pencil, Trash2, X, Check, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCropImage } from '../../utils/cropImages';

const FarmerDashboardView = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ cropName: '', quantity: '', price: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'listings'), where('farmerId', '==', user._id || 'demo_user'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(d => ({ _id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const startEdit = (listing) => {
    setEditingId(listing._id);
    setEditForm({
      cropName: listing.cropName,
      quantity: listing.quantity,
      price: listing.price
    });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        cropName: editForm.cropName,
        quantity: parseFloat(editForm.quantity),
        price: parseFloat(editForm.price)
      });
      setEditingId(null);
    } catch (err) { console.error(err); alert('Save failed'); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-cream p-6 pb-32 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black text-charcoal leading-tight">Farmer Hub</h1>
          <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">Signed in as Ramesh Singh</p>
        </motion.div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          className="rounded-2xl shadow-lg border-2 border-white overflow-hidden"
        >
          <Link to="/farmer-deliveries" className="w-14 h-14 bg-primary flex flex-col items-center justify-center text-white p-1 hover:bg-secondary transition-colors">
            <Truck className="w-6 h-6 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Track</span>
          </Link>
        </motion.div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border border-light-gray"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="text-primary w-5 h-5" />
          </div>
          <p className="text-[10px] text-charcoal/40 uppercase font-black tracking-tighter mb-1">Total Sales</p>
          <p className="text-2xl font-black text-charcoal">₹12,450</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border border-light-gray"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
            <Package className="text-accent w-5 h-5" />
          </div>
          <p className="text-[10px] text-charcoal/40 uppercase font-black tracking-tighter mb-1">Active Listings</p>
          <p className="text-2xl font-black text-charcoal">{listings.length}</p>
        </motion.div>
      </div>

      {/* CTA — Add New Listing */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <Link
          to="/create-listing"
          className="group relative block bg-primary text-white p-6 rounded-[32px] shadow-2xl shadow-primary/30 font-black text-lg overflow-hidden transition-all active:scale-95"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <Plus className="w-6 h-6" />
            Add Crop for Selling
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
        </Link>
      </motion.div>

      {/* Listings */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-black text-charcoal">Your Active Crops</h2>
          <Link to="/marketplace" className="text-xs font-black text-primary uppercase border-b-2 border-primary/20 pb-1">
            Browse Market
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-bold text-charcoal/40">{t('loading_data')}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-charcoal/40 font-bold mb-2">No crops listed yet</p>
            <Link to="/create-listing" className="text-primary font-black underline">Add your first crop →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {listings.map((listing, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={listing._id}
                  className="bg-white rounded-[28px] shadow-sm border border-light-gray/50 overflow-hidden"
                >
                  {editingId !== listing._id ? (
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-primary/10">
                          <img src={getCropImage(listing.cropName)} alt={listing.cropName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-black text-charcoal text-lg">{listing.cropName}</h3>
                          <p className="text-[10px] font-bold text-charcoal/40 uppercase">
                            {listing.quantity} Qtl · ₹{listing.price}/Qtl
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(listing)}
                          className="w-10 h-10 bg-light-gray/50 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all text-charcoal/40"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteListing(listing._id)}
                          className="w-10 h-10 bg-light-gray/50 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all text-charcoal/40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-blue-50/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-blue-600 uppercase">Editing Listing</p>
                        <button onClick={cancelEdit} className="text-charcoal/40 hover:text-charcoal/60"><X className="w-5 h-5" /></button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Potato'].map(crop => (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, cropName: crop })}
                            className={`py-2.5 rounded-2xl font-bold text-xs transition-all ${editForm.cropName === crop
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-white text-charcoal/50 border border-light-gray'
                            }`}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-charcoal/40 uppercase block mb-1">Quantity (Qtl)</label>
                          <input
                            type="number"
                            value={editForm.quantity}
                            onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="w-full h-12 bg-white rounded-2xl px-4 font-bold text-sm outline-none focus:ring-2 ring-primary/20 border border-light-gray"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-charcoal/40 uppercase block mb-1">Price (₹/Qtl)</label>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                            className="w-full h-12 bg-white rounded-2xl px-4 font-bold text-sm outline-none focus:ring-2 ring-primary/20 border border-light-gray"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => saveEdit(listing._id)}
                        className="w-full h-12 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        <Check className="w-5 h-5" /> Save Changes
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>


    </div>
  );
};

export default FarmerDashboardView;

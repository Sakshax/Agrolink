import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, MapPin, CreditCard, Truck, CheckCircle, Loader2, IndianRupee, Plus, Minus } from 'lucide-react';
import { getCropImage } from '../../utils/cropImages';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';

const CheckoutView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'UPI'
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing({ _id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const incrementQty = () => {
    if (listing && purchaseQty < (listing.quantity || 100)) {
        setPurchaseQty(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (purchaseQty > 1) {
        setPurchaseQty(prev => prev - 1);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill in all details");
      return;
    }

    try {
      setOrderLoading(true);
      const totalPrice = listing.price * purchaseQty;
      const orderRef = await addDoc(collection(db, 'orders'), {
        listingId: listing._id,
        farmerId: listing.farmerId || 'demo_farmer',
        buyerId: user?._id || 'demo_buyer',
        cropName: listing.cropName,
        quantity: purchaseQty,
        totalPrice: totalPrice,
        address: `${form.name}, ${form.phone}, ${form.address}`,
        paymentMethod: form.paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
        timeline: [
          { label: 'Order Placed', time: new Date().toLocaleTimeString(), done: true }
        ]
      });
      
      setOrderId(orderRef.id);
      setOrderSuccess(true);
      
      setTimeout(() => navigate(`/tracking/${orderRef.id}`), 3000);
    } catch (err) {
      console.error(err);
      alert("Order failed. Please check connection.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!listing) return <div className="p-10 text-center font-bold">Listing not found</div>;

  return (
    <div className="min-h-screen bg-cream font-sans pb-32">
       {/* Premium Header */}
       <div className="bg-primary p-6 rounded-b-[40px] shadow-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 text-white">
             <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-xl">
                <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="text-xl font-black">{t('checkout_title') || 'Confirm Order'}</h1>
          </div>
       </div>

       <AnimatePresence>
          {orderSuccess ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-primary" />
               </div>
               <h2 className="text-3xl font-black text-charcoal mb-2">Shukriya! Order Placed</h2>
               <p className="text-charcoal/50 font-bold mb-8">Apka order safaltapurvak darj ho gaya hai. Ab aap ise track kar sakte hain.</p>
               <button 
                onClick={() => navigate(`/tracking/${orderId}`)}
                className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30"
               >
                 Track My Order Now
               </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
               {/* Order Summary Card with Quantity Selector */}
               <div className="bg-white rounded-[32px] p-6 shadow-sm border border-light-gray">
                  <div className="flex gap-4">
                     <div className="w-24 h-24 rounded-2xl overflow-hidden border border-light-gray uppercase">
                        <img src={getCropImage(listing.cropName)} alt={listing.cropName} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 py-1">
                        <h3 className="text-lg font-black text-charcoal leading-tight">{listing.cropName}</h3>
                        <p className="text-[10px] font-bold text-charcoal/40 mt-1 uppercase tracking-wider">₹{listing.price} per Quintal</p>
                        
                        {/* Quantity Selector UI */}
                        <div className="flex items-center gap-4 mt-3">
                           <button 
                            onClick={decrementQty}
                            disabled={purchaseQty <= 1}
                            className="w-10 h-10 rounded-xl border border-light-gray flex items-center justify-center text-charcoal/60 hover:bg-light-gray/50 disabled:opacity-30 transition-all"
                           >
                              <Minus className="w-4 h-4" />
                           </button>
                           <span className="text-lg font-black text-charcoal w-8 text-center">{purchaseQty}</span>
                           <button 
                            onClick={incrementQty}
                            disabled={purchaseQty >= (listing.quantity || 100)}
                            className="w-10 h-10 rounded-xl border border-light-gray flex items-center justify-center text-charcoal/60 hover:bg-light-gray/50 disabled:opacity-30 transition-all"
                           >
                              <Plus className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Price Summary */}
               <div className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Amount</p>
                    <p className="text-2xl font-black text-primary mt-1">₹{listing.price * purchaseQty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Weight</p>
                    <p className="text-sm font-black text-charcoal/60 mt-1">{purchaseQty} Quintals</p>
                  </div>
               </div>

               {/* Form */}
               <div className="bg-white rounded-[32px] p-6 shadow-sm border border-light-gray">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                     <MapPin className="w-5 h-5 text-primary" /> Delivery Details
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-charcoal/40 uppercase ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Your Name"
                          className="w-full h-14 bg-light-gray/50 border border-light-gray rounded-2xl px-4 font-bold outline-none focus:ring-2 ring-primary/20 transition-all mt-1"
                          value={form.name}
                          onChange={(e) => setForm({...form, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-charcoal/40 uppercase ml-1">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="000 000 0000"
                          className="w-full h-14 bg-light-gray/50 border border-light-gray rounded-2xl px-4 font-bold outline-none focus:ring-2 ring-primary/20 transition-all mt-1"
                          value={form.phone}
                          onChange={(e) => setForm({...form, phone: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-charcoal/40 uppercase ml-1">Shipping Address</label>
                        <textarea 
                          placeholder="Village, Tehsil, District..."
                          className="w-full h-32 bg-light-gray/50 border border-light-gray rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20 transition-all mt-1 resize-none"
                          value={form.address}
                          onChange={(e) => setForm({...form, address: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               {/* Payment Selection */}
               <div className="bg-white rounded-[32px] p-6 shadow-sm border border-light-gray">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                      onClick={() => setForm({...form, paymentMethod: 'UPI'})}
                      className={`h-24 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${form.paymentMethod === 'UPI' ? 'border-primary bg-primary/5 text-primary' : 'border-light-gray text-charcoal/40'}`}
                     >
                        <IndianRupee className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase">UPI / Online</span>
                     </button>
                     <button 
                      onClick={() => setForm({...form, paymentMethod: 'COD'})}
                      className={`h-24 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${form.paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-light-gray text-charcoal/40'}`}
                     >
                        <Truck className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase">Cash on Delivery</span>
                     </button>
                  </div>
               </div>

               {/* Buy Button */}
               <button 
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="w-full h-20 bg-primary text-white font-black text-xl rounded-[28px] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
               >
                  {orderLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>Confirm & Place Order</>
                  )}
               </button>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default CheckoutView;

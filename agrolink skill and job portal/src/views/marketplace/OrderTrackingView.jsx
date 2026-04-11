import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Package, Clock, ShieldCheck, Loader2, Play } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const OrderTrackingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'orders', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock, desc: 'Order is waiting for pickup.' },
    { id: 'in-transit', label: 'In Transit', icon: Truck, desc: 'Crop is being transported to your location.' },
    { id: 'delivered', label: 'Delivered', icon: Package, desc: 'Item successfully delivered.' },
  ];

  const simulateNextStep = async () => {
    if (!order || updating) return;
    const currentIndex = steps.findIndex(s => s.id === order.status);
    if (currentIndex < steps.length - 1) {
      try {
        setUpdating(true);
        const nextStatus = steps[currentIndex + 1].id;
        // Also mock some coords for the MapTracker if transitioning to delivered
        const timelineEntry = {
            label: nextStatus === 'in-transit' ? 'Check Point 1' : 'Delivered',
            time: new Date().toLocaleTimeString(),
            done: true,
            coords: nextStatus === 'in-transit' ? { lat: 18.7481, lng: 73.4072 } : { lat: 19.0760, lng: 72.8777 }
        };
        
        await updateDoc(doc(db, 'orders', id), { 
           status: nextStatus,
           timeline: [...(order.timeline || []), timelineEntry]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating(false);
      }
    }
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === order?.status);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!order) return <div className="p-10 text-center font-bold">Order not found</div>;

  return (
    <div className="min-h-screen bg-cream font-sans pb-32">
       {/* Premium Header */}
       <div className="bg-primary p-6 rounded-b-[40px] shadow-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 text-white">
             <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-xl">
                <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="text-xl font-black">Track Your Crop</h1>
          </div>
       </div>

       <div className="p-6 space-y-6">
          {/* Order Info Header */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-light-gray relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1">Order ID</p>
                   <p className="font-black text-xs text-charcoal">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1">Expected Delivery</p>
                   <p className="font-black text-xs text-primary">In 2-3 Days</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          {/* Vertical Timeline */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-light-gray">
             <div className="space-y-10 relative">
                {/* Timeline Line */}
                <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-light-gray" />
                <div 
                  className="absolute left-[23px] top-6 w-[2px] bg-primary transition-all duration-1000" 
                  style={{ height: `${(Math.max(getCurrentStepIndex(), 0) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                   const isCompleted = index <= getCurrentStepIndex();
                   const isActive = index === getCurrentStepIndex();
                   const Icon = step.icon;

                   return (
                     <div key={step.id} className="flex gap-6 relative">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isCompleted ? '#1B6B3A' : '#F0F0F0'
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 shadow-lg ${isCompleted ? 'text-white' : 'text-charcoal/30'}`}
                        >
                           <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1 py-1">
                           <h3 className={`font-black uppercase text-xs tracking-wider transition-colors ${isCompleted ? 'text-charcoal' : 'text-charcoal/30'}`}>
                              {step.label}
                           </h3>
                           <p className={`text-xs font-bold leading-snug mt-1 transition-colors ${isCompleted ? 'text-charcoal/50' : 'text-charcoal/30'}`}>
                              {step.desc}
                           </p>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-light-gray">
             <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Destination
             </h3>
             <p className="text-sm font-bold text-charcoal/50 leading-relaxed px-1">
                {order.address || 'Check instructions for village location.'}
             </p>
          </div>

          {/* Farmer Check */}
          <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-primary/20">
                <ShieldCheck className="w-6 h-6 text-primary" />
             </div>
             <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Verified AgroLink Logistics</p>
                <p className="text-xs font-bold text-charcoal/60">Secure delivery in progress.</p>
             </div>
          </div>

          {/* Demo Controls */}
          <button 
            onClick={simulateNextStep}
            disabled={updating || order.status === 'delivered'}
            className="w-full h-16 bg-charcoal text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
             {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Simulate Next Step Tracking Update</>}
          </button>
       </div>
    </div>
  );
};

export default OrderTrackingView;

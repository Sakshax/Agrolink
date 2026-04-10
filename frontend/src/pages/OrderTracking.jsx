import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Package, Clock, ShieldCheck, Loader2, Play } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Auto-refresh in demo mode every 10s if not delivered
    const interval = setInterval(() => {
        if (order && order.orderStatus !== 'Delivered') fetchOrder();
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const simulateNextStep = async () => {
    if (!order || updating) return;
    const steps = ['Created', 'Accepted', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(order.orderStatus);
    if (currentIndex < steps.length - 1) {
      try {
        setUpdating(true);
        const nextStatus = steps[currentIndex + 1];
        await axios.patch(`http://localhost:5000/api/orders/${id}/status`, { status: nextStatus });
        await fetchOrder();
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating(false);
      }
    }
  };

  const steps = [
    { id: 'Created', label: 'Order Placed', icon: Clock, desc: 'Your request has been sent to the farmer.' },
    { id: 'Accepted', label: 'Confirmed', icon: CheckCircle2, desc: 'Farmer has accepted your order.' },
    { id: 'Shipped', label: 'In Transit', icon: Truck, desc: 'Crop is being transported to your location.' },
    { id: 'Delivered', label: 'Delivered', icon: Package, desc: 'Item successfully delivered.' },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === order?.orderStatus);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF7]">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!order) return <div className="p-10 text-center font-bold">Order not found</div>;

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans pb-32">
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
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                   <p className="font-black text-xs text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                   <p className="font-black text-xs text-primary">In 2-3 Days</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          {/* Vertical Timeline */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
             <div className="space-y-10 relative">
                {/* Timeline Line */}
                <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gray-100" />
                <div 
                  className="absolute left-[23px] top-6 w-[2px] bg-primary transition-all duration-1000" 
                  style={{ height: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
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
                            backgroundColor: isCompleted ? '#2E7D32' : '#F3F4F6'
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 shadow-lg ${isCompleted ? 'text-white' : 'text-gray-300'}`}
                        >
                           <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1 py-1">
                           <h3 className={`font-black uppercase text-xs tracking-wider transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                              {step.label}
                           </h3>
                           <p className={`text-xs font-bold leading-snug mt-1 transition-colors ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                              {step.desc}
                           </p>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
             <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Destination
             </h3>
             <p className="text-sm font-bold text-gray-500 leading-relaxed px-1">
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
                <p className="text-xs font-bold text-gray-600">Secure delivery in progress.</p>
             </div>
          </div>

          {/* Demo Controls */}
          <button 
            onClick={simulateNextStep}
            disabled={updating || order.orderStatus === 'Delivered'}
            className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
             {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Simulate Next Step (Demo)</>}
          </button>
       </div>
    </div>
  );
};

export default OrderTracking;

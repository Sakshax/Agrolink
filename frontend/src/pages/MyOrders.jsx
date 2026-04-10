import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, Box, Loader2, ArrowLeft } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Created': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Accepted': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Shipped': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Delivered': return <Box className="w-5 h-5 text-purple-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Created': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Accepted': return 'bg-green-50 text-green-600 border-green-100';
      case 'Shipped': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Delivered': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF7]">
       <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans pb-32">
       {/* Premium Header */}
       <div className="bg-primary p-6 rounded-b-[40px] shadow-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 text-white">
             <button onClick={() => navigate('/marketplace')} className="p-2 bg-white/10 rounded-xl">
                <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="text-xl font-black">My Purchase History</h1>
          </div>
       </div>

       <div className="p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
               <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold">No orders found yet.</p>
               <button 
                onClick={() => navigate('/marketplace')}
                className="mt-4 text-primary font-black uppercase text-xs"
               >
                 Go Shopping →
               </button>
            </div>
          ) : (
            <AnimatePresence>
               {orders.map((order, i) => (
                 <motion.div 
                   key={order._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => navigate(`/tracking/${order._id}`)}
                   className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                 >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${getStatusColor(order.orderStatus)}`}>
                       {getStatusIcon(order.orderStatus)}
                    </div>
                    <div className="flex-1">
                       <h3 className="font-black text-gray-900 leading-tight">Order for {order.quantity} Qtl Crop</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">₹{order.totalPrice}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</span>
                       </div>
                       <div className={`mt-2 px-2 py-0.5 rounded-lg text-[8px] font-black w-fit border ${getStatusColor(order.orderStatus)} uppercase`}>
                          {order.orderStatus}
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                 </motion.div>
               ))}
            </AnimatePresence>
          )}
       </div>
    </div>
  );
};

export default MyOrders;

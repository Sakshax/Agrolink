import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const DriverDashboardView = () => {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    // A driver wants to see all active orders that need shipping. In a real app we might route it directly to a specific driver.
    const q = query(collection(db, 'orders'), where('status', 'in', ['pending', 'in-transit']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDeliveries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const order = deliveries.find(d => d.id === id);
      const timelineEntry = {
        label: newStatus === 'in-transit' ? 'Picked Up by Driver' : 'Delivered by Driver',
        time: new Date().toLocaleTimeString(),
        done: true,
        coords: newStatus === 'in-transit' ? { lat: 18.7481, lng: 73.4072 } : { lat: 19.0760, lng: 72.8777 }
      };

      await updateDoc(doc(db, 'orders', id), {
        status: newStatus,
        timeline: [...(order.timeline || []), timelineEntry]
      });
    } catch (e) {
      console.error("Error updating status: ", e);
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-light-gray">
        <div>
          <h1 className="text-xl font-black text-charcoal flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" /> Delivery Hub
          </h1>
          <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest mt-1">Status Updater</p>
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.length === 0 && <p className="text-center font-bold text-charcoal/40 py-10">No pending deliveries.</p>}
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-light-gray flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">#{delivery.id.slice(-8).toUpperCase()}</span>
                 <h3 className="font-bold text-lg text-charcoal">{delivery.cropName} - {delivery.quantity} Qtl</h3>
               </div>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                 delivery.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                 'bg-amber-100 text-amber-700'
               }`}>
                 {delivery.status}
               </span>
             </div>

             <div className="flex items-center gap-2 text-xs font-bold text-charcoal/60 bg-light-gray/30 p-2 rounded-xl">
               <MapPin className="w-4 h-4 text-primary shrink-0" />
               <span className="truncate">Source</span>
               <span className="mx-1">→</span>
               <span className="truncate">{delivery.address || 'Unknown'}</span>
             </div>

             <div className="pt-3 border-t border-light-gray flex gap-2">
               {delivery.status === 'pending' && (
                 <button onClick={() => updateStatus(delivery.id, 'in-transit')} className="flex-1 bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl flex justify-center items-center gap-2 hover:bg-blue-600 active:scale-95 transition-all">
                   <Clock className="w-4 h-4" /> Start Transit
                 </button>
               )}
               {delivery.status === 'in-transit' && (
                 <button onClick={() => updateStatus(delivery.id, 'delivered')} className="flex-1 bg-green-500 text-white font-bold text-xs py-3 rounded-2xl flex justify-center items-center gap-2 hover:bg-green-600 active:scale-95 transition-all">
                   <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                 </button>
               )}
               {delivery.status === 'delivered' && (
                 <div className="flex-1 bg-light-gray/50 text-charcoal/40 font-bold text-xs py-3 rounded-2xl flex justify-center items-center gap-2">
                   <CheckCircle2 className="w-4 h-4" /> Completed
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverDashboardView;

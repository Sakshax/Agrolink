import React from 'react';

const MandiAdmin = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-10 font-sans">
       <div className="bg-white p-12 rounded-[40px] shadow-sm border border-light-gray text-center max-w-lg">
          <h1 className="text-3xl font-black text-charcoal mb-4">Admin Hub</h1>
          <p className="text-charcoal/40 font-bold mb-8">This page is ready for your Admin Panel integration. Currently logged in as System Administrator.</p>
          <div className="w-full h-1 bg-primary/10 rounded-full mx-auto"></div>
       </div>
    </div>
  );
};

export default MandiAdmin;

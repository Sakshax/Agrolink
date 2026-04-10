import React from 'react';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10 font-sans">
       <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 text-center max-w-lg">
          <h1 className="text-3xl font-black text-gray-900 mb-4">Admin Hub</h1>
          <p className="text-gray-400 font-bold mb-8">This page is ready for your Admin Panel integration. Currently logged in as System Administrator.</p>
          <div className="w-16 h-1 w-full bg-primary/10 rounded-full mx-auto"></div>
       </div>
    </div>
  );
};

export default Admin;

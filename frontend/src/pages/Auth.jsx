import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Wheat, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null); // 'Farmer' or 'Buyer'
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Helper to map username to email for Firebase Auth
  const getEmail = (username) => `${username.toLowerCase().trim()}@agrolink.app`;

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Special case for Fixed Admin Credentials
    if (formData.username === 'admin.agrolink@gmail.com' && formData.password === '12345678') {
      const adminUser = { username: 'Admin', role: 'Admin', _id: 'static_admin_id' };
      dispatch(loginSuccess(adminUser));
      navigate('/admin');
      return;
    }

    if (!role && !isLogin) {
      alert("Please select a role first!");
      return;
    }

    dispatch(loginStart());
    try {
      // Logic for regular Firebase users: Use custom email or their actual email if provided
      const email = formData.username.includes('@') ? formData.username : getEmail(formData.username);
      let userRes;
      let finalUser;

      if (isLogin) {
        // 1. Firebase Login
        userRes = await signInWithEmailAndPassword(auth, email, formData.password);
        
        // 2. Fetch Role from Firestore
        const userDoc = await getDoc(doc(db, "users", userRes.user.uid));
        if (userDoc.exists()) {
          finalUser = { 
            username: formData.username, 
            role: userDoc.data().role, 
            _id: userRes.user.uid 
          };
        } else {
          throw new Error("User profile not found in database");
        }
      } else {
        // 1. Firebase Register
        userRes = await createUserWithEmailAndPassword(auth, email, formData.password);
        
        // 2. Save Role to Firestore
        finalUser = { 
          username: formData.username, 
          role: role, 
          _id: userRes.user.uid 
        };
        await setDoc(doc(db, "users", userRes.user.uid), {
          username: formData.username,
          role: role,
          createdAt: new Date().toISOString()
        });
      }
      
      dispatch(loginSuccess(finalUser));
      
      // Redirect based on role
      if (finalUser.role === 'Farmer') {
        navigate('/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      let msg = 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = 'Invalid username or password';
      if (err.code === 'auth/email-already-in-use') msg = 'Username already exists';
      dispatch(loginFailure(msg));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans flex flex-col items-center justify-center p-6 pb-32">
      {/* App Logo/Branding */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 mb-4">
           <Wheat className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">AgroLink</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Powered by Firebase</p>
      </motion.div>

      <motion.div 
        layout
        className="w-full max-w-md bg-white rounded-[48px] p-8 shadow-sm border border-gray-100"
      >
        <div className="flex bg-gray-50 p-2 rounded-[28px] mb-8">
           <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
           >
             Login
           </button>
           <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
           >
             Register
           </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Your Role</p>
                <div className="grid grid-cols-2 gap-4">
                   <div 
                    onClick={() => setRole('Farmer')}
                    className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${role === 'Farmer' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}`}
                   >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'Farmer' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                         <Wheat className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black uppercase ${role === 'Farmer' ? 'text-primary' : 'text-gray-400'}`}>Farmer</span>
                   </div>
                   <div 
                    onClick={() => setRole('Buyer')}
                    className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${role === 'Buyer' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}`}
                   >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'Buyer' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                         <ShoppingBag className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black uppercase ${role === 'Buyer' ? 'text-primary' : 'text-gray-400'}`}>Buyer</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
             <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Username or Email"
                  className="w-full h-16 bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
             </div>
             <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full h-16 bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
             </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      <p className="mt-8 text-gray-400 font-bold text-[10px] uppercase tracking-widest text-center px-10 leading-loose">
        Your data is securely saved with Firebase Cloud Infrastructure.
      </p>
    </div>
  );
};

export default Auth;

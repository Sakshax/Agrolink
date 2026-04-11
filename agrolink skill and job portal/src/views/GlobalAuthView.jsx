import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Wheat, ShoppingBag, Truck, ShieldCheck, Loader2, Play } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const GlobalAuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const getEmail = (username) => `${username.toLowerCase().trim()}@agrolink.app`;

  const navigateToRoleDashboard = (userRole) => {
    if (userRole === 'Farmer') navigate('/mandi-dashboard');
    else if (userRole === 'Buyer') navigate('/marketplace');
    else if (userRole === 'Driver') navigate('/driver-dashboard');
    else if (userRole === 'Admin') navigate('/mandi-admin');
    else navigate('/');
  };

  const handleDemoLogin = async (demoRole) => {
    const mockUser = {
      username: `${demoRole} Demo`,
      role: demoRole,
      _id: `demo_${demoRole.toLowerCase()}_123`,
      isDemo: true
    };
    dispatch(loginSuccess(mockUser));
    navigateToRoleDashboard(demoRole);
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!role && !isLogin) {
      alert("Please select a role first!");
      return;
    }

    dispatch(loginStart());
    try {
      const email = formData.username.includes('@') ? formData.username : getEmail(formData.username);
      let userRes;
      let finalUser;

      if (isLogin) {
        userRes = await signInWithEmailAndPassword(auth, email, formData.password);
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
        userRes = await createUserWithEmailAndPassword(auth, email, formData.password);
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
      navigateToRoleDashboard(finalUser.role);
    } catch (err) {
      let msg = 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = 'Invalid username or password';
      if (err.code === 'auth/email-already-in-use') msg = 'Username already exists';
      dispatch(loginFailure(msg));
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col items-center justify-center p-6 pb-32 overflow-y-auto w-full no-scrollbar">
      {/* App Logo/Branding */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 mt-10"
      >
        <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 mb-4">
           <Wheat className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-charcoal tracking-tight">AgroLink</h1>
        <p className="text-charcoal/40 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Unified Platform</p>
      </motion.div>

      {/* Quick Demo Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md mb-8 space-y-3"
      >
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest text-center px-10">Quick Access Demo Testing</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleDemoLogin('Farmer')} className="flex items-center justify-center gap-2 bg-primary/10 text-primary p-3 rounded-2xl font-bold text-xs hover:bg-primary/20 transition-colors">
            <Wheat className="w-4 h-4" /> Demo Farmer
          </button>
          <button onClick={() => handleDemoLogin('Buyer')} className="flex items-center justify-center gap-2 bg-blue-500/10 text-blue-600 p-3 rounded-2xl font-bold text-xs hover:bg-blue-500/20 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Demo Buyer
          </button>
          <button onClick={() => handleDemoLogin('Driver')} className="flex items-center justify-center gap-2 bg-amber-500/10 text-amber-600 p-3 rounded-2xl font-bold text-xs hover:bg-amber-500/20 transition-colors">
            <Truck className="w-4 h-4" /> Demo Driver
          </button>
          <button onClick={() => handleDemoLogin('Admin')} className="flex items-center justify-center gap-2 bg-red-500/10 text-red-600 p-3 rounded-2xl font-bold text-xs hover:bg-red-500/20 transition-colors">
            <ShieldCheck className="w-4 h-4" /> Demo Admin
          </button>
        </div>
      </motion.div>

      <motion.div 
        layout
        className="w-full max-w-md bg-white rounded-[48px] p-8 shadow-sm border border-light-gray"
      >
        <div className="flex bg-light-gray/50 p-2 rounded-[28px] mb-8">
           <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-charcoal/40'}`}
           >
             Login
           </button>
           <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-charcoal/40'}`}
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
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1">Select Your Role</p>
                <div className="grid grid-cols-3 gap-2">
                   <div 
                    onClick={() => setRole('Farmer')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1 ${role === 'Farmer' ? 'border-primary bg-primary/5' : 'border-light-gray hover:border-primary/30'}`}
                   >
                      <Wheat className={`w-5 h-5 ${role === 'Farmer' ? 'text-primary' : 'text-charcoal/40'}`} />
                      <span className={`text-[10px] font-black uppercase ${role === 'Farmer' ? 'text-primary' : 'text-charcoal/40'}`}>Farmer</span>
                   </div>
                   <div 
                    onClick={() => setRole('Buyer')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1 ${role === 'Buyer' ? 'border-primary bg-primary/5' : 'border-light-gray hover:border-primary/30'}`}
                   >
                      <ShoppingBag className={`w-5 h-5 ${role === 'Buyer' ? 'text-primary' : 'text-charcoal/40'}`} />
                      <span className={`text-[10px] font-black uppercase ${role === 'Buyer' ? 'text-primary' : 'text-charcoal/40'}`}>Buyer</span>
                   </div>
                   <div 
                    onClick={() => setRole('Driver')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1 ${role === 'Driver' ? 'border-primary bg-primary/5' : 'border-light-gray hover:border-primary/30'}`}
                   >
                      <Truck className={`w-5 h-5 ${role === 'Driver' ? 'text-primary' : 'text-charcoal/40'}`} />
                      <span className={`text-[10px] font-black uppercase ${role === 'Driver' ? 'text-primary' : 'text-charcoal/40'}`}>Driver</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
             <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                <input 
                  type="text" 
                  placeholder="Username or Email"
                  className="w-full h-16 bg-light-gray/50 border border-light-gray rounded-[24px] pl-14 pr-6 font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
             </div>
             <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full h-16 bg-light-gray/50 border border-light-gray rounded-[24px] pl-14 pr-6 font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
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

      <p className="mt-8 text-charcoal/40 font-bold text-[10px] uppercase tracking-widest text-center px-10 leading-loose">
        Your data is securely saved with Firebase Cloud Infrastructure.
      </p>
    </div>
  );
};

export default GlobalAuthView;

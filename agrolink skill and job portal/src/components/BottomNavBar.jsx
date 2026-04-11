import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Briefcase, User, ShoppingBag, LayoutDashboard, History, Truck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLanguage } from '../LanguageContext';

export default function BottomNavBar() {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();

  if (!user) return null;

  let tabs = [];

  if (user.role === 'Farmer') {
    tabs = [
      { to: '/courses', icon: BookOpen, label: t('Courses', 'कोर्स') },
      { to: '/jobs',    icon: Briefcase, label: t('Jobs', 'नौकरी') },
      { to: '/mandi-dashboard', icon: LayoutDashboard, label: t('Mandi', 'मंडी') },
      { to: '/profile', icon: User,      label: t('Profile', 'प्रोफाइल') },
    ];
  } else if (user.role === 'Buyer') {
    tabs = [
      { to: '/marketplace', icon: ShoppingBag, label: t('Mandi', 'मंडी') },
      { to: '/orders', icon: History, label: t('Orders', 'ऑर्डर') },
      { to: '/profile', icon: User, label: t('Profile', 'प्रोफाइल') },
    ];
  } else if (user.role === 'Driver') {
    tabs = [
      { to: '/driver-dashboard', icon: Truck, label: 'Deliveries' },
      { to: '/profile', icon: User, label: t('Profile', 'प्रोफाइल') },
    ];
  }

  // Admin and users without valid bottom nav roles shouldn't see it (or Admin is handled in TopAppBar)
  if (tabs.length === 0 || user.role === 'Admin') return null;

  return (
    <nav className="bg-white absolute bottom-0 w-full h-[68px] border-t border-light-gray/60 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-stretch z-20">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200
             ${isActive
               ? 'text-primary-green scale-105'
               : 'text-charcoal/40 hover:text-charcoal/60'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary-green/10' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold leading-none uppercase tracking-tight`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

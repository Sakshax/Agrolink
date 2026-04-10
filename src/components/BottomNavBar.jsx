import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Briefcase, User } from 'lucide-react';

const tabs = [
  { to: '/courses', icon: BookOpen, label: 'Courses', labelHi: 'कोर्स' },
  { to: '/jobs',    icon: Briefcase, label: 'Jobs',    labelHi: 'नौकरी' },
  { to: '/profile', icon: User,      label: 'Profile', labelHi: 'प्रोफाइल' },
];

export default function BottomNavBar() {
  return (
    <nav className="bg-white absolute bottom-0 w-full h-[68px] border-t border-light-gray/60 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-stretch z-20">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200
             ${isActive
               ? 'text-primary-green'
               : 'text-charcoal/40 hover:text-charcoal/60'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary-green/10' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-semibold leading-none ${isActive ? '' : 'font-medium'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

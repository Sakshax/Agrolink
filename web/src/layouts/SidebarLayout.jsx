import { useState } from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import { ShieldCheck, Map, Truck, Wheat, Menu, X, Globe, LogOut, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../context/AuthContext";

const ROLE_NAV = {
  admin:  [{ key: "navAdmin",    to: "/admin",    icon: ShieldCheck }],
  buyer:  [{ key: "navBuyer",    to: "/buyer",    icon: Map }],
  driver: [{ key: "navDelivery", to: "/delivery", icon: Truck }],
  farmer: [{ key: "navFarmer",   to: "/farmer",   icon: Wheat }],
};

const ROLE_COLORS = {
  admin:  "bg-purple-500",
  buyer:  "bg-blue-500",
  driver: "bg-amber-500",
  farmer: "bg-green-500",
};

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();

  // If somehow no user, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  const navItems = (ROLE_NAV[user.role] || []).map((item) => ({
    ...item,
    name: t(item.key),
  }));

  return (
    <div className="flex h-screen bg-background text-text">
       {/* Mobile overlay */}
       {sidebarOpen && (
         <div
           className="fixed inset-0 bg-black/40 z-40 lg:hidden"
           onClick={() => setSidebarOpen(false)}
         />
       )}

       {/* Sidebar */}
       <aside
         className={cn(
           "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
           sidebarOpen ? "translate-x-0" : "-translate-x-full"
         )}
       >
         <div className="p-6 border-b border-white/20 flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-heading font-bold text-white">{t("appName")}</h1>
             <p className="text-sm opacity-80 mt-1">{t("appTagline")}</p>
           </div>
           <button
             className="lg:hidden text-white/80 hover:text-white"
             onClick={() => setSidebarOpen(false)}
           >
             <X className="w-5 h-5" />
           </button>
         </div>

         {/* User Info */}
         <div className="px-4 pt-5 pb-3">
           <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10">
             <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
               {user.avatar}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
               <p className="text-[10px] text-white/60 truncate">{user.username}</p>
             </div>
           </div>
         </div>
         
         <nav className="flex-1 py-3 px-4 space-y-2">
           {navItems.map((item) => (
             <NavLink
               key={item.to}
               to={item.to}
               end
               onClick={() => setSidebarOpen(false)}
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-4 py-3 rounded-button font-body font-medium transition-colors",
                   isActive
                     ? "bg-secondary text-white shadow-sm"
                     : "text-white/80 hover:bg-white/10 hover:text-white"
                 )
               }
             >
               <item.icon className="w-5 h-5" />
               {item.name}
             </NavLink>
           ))}
         </nav>

         {/* Language Switcher */}
         <div className="px-4 pb-2">
           <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
             <Globe className="w-4 h-4 text-white/70 shrink-0" />
             <select
               value={locale}
               onChange={(e) => setLocale(e.target.value)}
               className="bg-transparent text-white text-sm font-medium w-full outline-none cursor-pointer appearance-none"
               style={{ WebkitAppearance: "none" }}
             >
               <option value="en" className="text-gray-800">{t("langEn")}</option>
               <option value="mr" className="text-gray-800">{t("langMr")}</option>
             </select>
           </div>
         </div>

         {/* Logout */}
         <div className="px-4 pb-3">
           <button
             onClick={logout}
             className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-white transition-colors text-sm font-medium"
           >
             <LogOut className="w-4 h-4" />
             {locale === "mr" ? "लॉग आउट" : "Log Out"}
           </button>
         </div>
         
         <div className="p-4 pt-0 border-t border-white/20 text-sm opacity-70 mt-1 pt-3">
           <p>{t("poweredBy")}</p>
         </div>
       </aside>

       {/* Main Content Area */}
       <main className="flex-1 flex flex-col overflow-hidden">
         <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 shadow-sm gap-3">
           <button
             className="lg:hidden text-gray-600 hover:text-primary"
             onClick={() => setSidebarOpen(true)}
           >
             <Menu className="w-5 h-5" />
           </button>
           <h2 className="text-base md:text-lg font-heading font-semibold text-text flex-1">{t("dashboard")}</h2>
           <div className="flex items-center gap-2">
             <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center text-white font-bold text-xs`}>
               {user.avatar}
             </div>
             <span className="hidden sm:block text-sm font-medium text-gray-600">{user.displayName}</span>
           </div>
         </header>
         <div className="flex-1 overflow-auto p-4 md:p-8">
           <Outlet />
         </div>
       </main>
    </div>
  );
}

import { useState } from "react";
import { Wheat, ShieldCheck, Truck, Map, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";

const ROLE_CARDS = [
  {
    username: "Krishna",
    role: "buyer",
    label: "Buyer",
    labelMr: "खरेदीदार",
    icon: Map,
    color: "from-blue-500 to-blue-600",
    ring: "ring-blue-300",
    desc: "Track orders & verify deliveries",
    descMr: "ऑर्डर ट्रॅक करा आणि वितरण सत्यापित करा",
  },
  {
    username: "Saksham",
    role: "farmer",
    label: "Farmer",
    labelMr: "शेतकरी",
    icon: Wheat,
    color: "from-green-500 to-green-600",
    ring: "ring-green-300",
    desc: "Manage produce & share QR codes",
    descMr: "उत्पादन व्यवस्थापित करा आणि QR कोड शेअर करा",
  },
  {
    username: "Driver",
    role: "driver",
    label: "Driver",
    labelMr: "चालक",
    icon: Truck,
    color: "from-amber-500 to-orange-500",
    ring: "ring-amber-300",
    desc: "Scan checkpoints & update status",
    descMr: "चेकपॉइंट स्कॅन करा आणि स्थिती अपडेट करा",
  },
  {
    username: "admin.agrolink@gmail.com",
    role: "admin",
    label: "Admin",
    labelMr: "प्रशासक",
    icon: ShieldCheck,
    color: "from-purple-500 to-indigo-600",
    ring: "ring-purple-300",
    desc: "Global monitoring & command center",
    descMr: "जागतिक देखरेख आणि नियंत्रण केंद्र",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t, locale } = useI18n();
  const isMr = locale === "mr";

  const [mode, setMode] = useState("cards"); // "cards" | "form"
  const [formUser, setFormUser] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleQuickLogin = (username) => {
    const result = login(username);
    if (!result.success) setError(result.error);
  };

  const handleFormLogin = (e) => {
    e.preventDefault();
    setError("");
    const result = login(formUser);
    if (!result.success) {
      setError(isMr ? "वापरकर्ता सापडला नाही. कृपया योग्य नाव किंवा ईमेल वापरा." : "User not found. Please use a valid name or email.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-100/40 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-amber-50/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg shadow-green-100/50 border border-green-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-heading font-bold text-primary">{t("appName")}</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{t("appTagline")}</p>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
            {isMr ? "स्वागत आहे" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            {isMr ? "सुरू ठेवण्यासाठी तुमची भूमिका निवडा" : "Select your role to continue"}
          </p>
        </div>

        {mode === "cards" ? (
          <>
            {/* Role Cards Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
              {ROLE_CARDS.map((card) => (
                <button
                  key={card.role}
                  onClick={() => handleQuickLogin(card.username)}
                  className="group relative bg-white rounded-2xl p-4 md:p-5 border-2 border-gray-100 hover:border-transparent shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
                >
                  {/* Gradient hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}></div>

                  <div className="relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md mb-3 group-hover:bg-white/20 group-hover:shadow-lg transition-all`}>
                      <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-sm md:text-base text-gray-800 group-hover:text-white transition-colors">
                      {isMr ? card.labelMr : card.label}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-500 group-hover:text-white/80 mt-1 transition-colors leading-relaxed">
                      {isMr ? card.descMr : card.desc}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-gray-400 group-hover:text-white/60 mt-2 font-mono transition-colors truncate">
                      {card.username}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gray-100 group-hover:bg-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                    <LogIn className="w-3 h-3 text-gray-400 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>

            {/* Manual login toggle */}
            <div className="text-center">
              <button
                onClick={() => setMode("form")}
                className="text-sm text-gray-400 hover:text-primary transition-colors font-medium"
              >
                {isMr ? "मॅन्युअल लॉगिन वापरा →" : "Use manual login →"}
              </button>
            </div>
          </>
        ) : (
          /* Manual Login Form */
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-green-100/30 border border-gray-100 max-w-sm mx-auto">
            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  {isMr ? "वापरकर्ता नाव / ईमेल" : "Username / Email"}
                </label>
                <input
                  type="text"
                  value={formUser}
                  onChange={(e) => { setFormUser(e.target.value); setError(""); }}
                  placeholder={isMr ? "तुमचे नाव किंवा ईमेल प्रविष्ट करा" : "Enter your name or email"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none text-sm transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  {isMr ? "पासवर्ड" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    defaultValue="agrolink123"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-green-100 outline-none text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {isMr ? "डेमो: कोणताही पासवर्ड चालेल" : "Demo: any password works"}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isMr ? "लॉगिन करा" : "Log In"}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => { setMode("cards"); setError(""); }}
                className="text-sm text-gray-400 hover:text-primary transition-colors font-medium"
              >
                {isMr ? "← भूमिका निवडीवर परत जा" : "← Back to role selection"}
              </button>
            </div>
          </div>
        )}

        {/* Language switcher at bottom */}
        <div className="flex justify-center mt-6 gap-2">
          <LanguagePill />
        </div>
      </div>
    </div>
  );
}

function LanguagePill() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setLocale("en")}
        className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
          locale === "en" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLocale("mr")}
        className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
          locale === "mr" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        मराठी
      </button>
    </div>
  );
}

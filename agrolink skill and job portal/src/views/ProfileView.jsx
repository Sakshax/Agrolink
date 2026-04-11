import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { profileData } from '../data/mockData';
import { getMarketPrices, getCourses, getJobs } from '../firebase/api';
import { TrendingUp, TrendingDown, Award, BookOpen, BarChart3, Briefcase, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { logout } from '../store/slices/authSlice';

export default function ProfileView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lang, t } = useLanguage();
  const { user } = useSelector(state => state.auth);
  const [marketPricesData, setMarketPricesData] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [incompleteCourses, setIncompleteCourses] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [prices, courses, jobs] = await Promise.all([
        getMarketPrices(),
        getCourses(),
        getJobs()
      ]);
      setMarketPricesData(prices);
      
      const comp = courses.filter(c => c.progress >= 100);
      const incomp = courses.filter(c => c.progress < 100);
      setCompletedCourses(comp);
      setIncompleteCourses(incomp);
      setTotalCourses(courses.length);
      setJobsData(jobs);
      
      setLoading(false);
    }
    loadData();
  }, []);

  // Compute qualified jobs (jobs that are in the recommendedJobs array of any completed course)
  const qualifiedJobIds = new Set();
  completedCourses.forEach(c => {
    if (c.recommendedJobs) {
      c.recommendedJobs.forEach(jId => qualifiedJobIds.add(jId));
    }
  });
  const qualifiedJobs = jobsData.filter(j => qualifiedJobIds.has(j.id));

  // Recommend at most 2 incomplete courses to improve profile
  const recommendedToImprove = incompleteCourses.slice(0, 2);

  return (
    <div className="space-y-6 animate-page-enter pb-4">
      {/* ── Profile Header ────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-green to-secondary-green rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-primary-green/20">
          {user?.username?.charAt(0)?.toUpperCase() || profileData.avatarInitial}
        </div>
        <h2 className="text-lg font-bold text-charcoal mt-3">{user?.username || profileData.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-primary-green text-xs font-black uppercase bg-primary-green/10 px-3 py-1 rounded-full">{user?.role || profileData.role}</p>
        </div>
        
        <button
          onClick={() => {
            dispatch(logout());
            navigate('/auth');
          }}
          className="mt-4 px-6 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors"
        >
          {t('Logout', 'लॉग आउट')}
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-primary-green">{completedCourses.length}</p>
          <p className="text-[11px] text-charcoal/55 font-medium">{t('Completed', 'पूरा हुआ')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-accent-amber">{totalCourses - completedCourses.length}</p>
          <p className="text-[11px] text-charcoal/55 font-medium">{t('In Progress', 'चालू')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-charcoal">{completedCourses.length}</p>
          <p className="text-[11px] text-charcoal/55 font-medium">{t('Certificates', 'प्रमाणपत्र')}</p>
        </div>
      </div>

      {/* ── Recommendations ─────────────────────────────────── */}
      {!loading && (
        <div className="space-y-3">
          {/* Qualified Jobs */}
          {qualifiedJobs.length > 0 && (
            <div className="bg-gradient-to-r from-primary-green/10 to-transparent p-4 rounded-2xl border border-primary-green/15">
              <h3 className="text-sm font-bold text-primary-green flex items-center gap-2 mb-2">
                <Briefcase size={16} /> {t("Jobs You're Qualified For", "नौकरियां जिनके लिए आप योग्य हैं")}
              </h3>
              <div className="space-y-2">
                {qualifiedJobs.map(job => (
                  <div key={job.id} onClick={() => navigate('/jobs')} className="bg-white px-3 py-2 rounded-xl border border-primary-green/10 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow">
                    <span className="text-[13px] font-semibold text-charcoal">{lang === 'en' ? job.title_en : job.title_hi || job.title_en}</span>
                    <span className="text-[11px] bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-lg whitespace-nowrap">{job.salary?.replace('₹', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improve Profile */}
          {recommendedToImprove.length > 0 && (
            <div className="bg-gradient-to-r from-accent-amber/10 to-transparent p-4 rounded-2xl border border-accent-amber/15">
              <h3 className="text-sm font-bold text-accent-amber flex items-center gap-2 mb-2">
                <Zap size={16} /> {t('Improve Your Profile', 'अपनी प्रोफाइल बेहतर करें')}
              </h3>
              <div className="space-y-2">
                {recommendedToImprove.map(course => (
                  <div key={course.id} onClick={() => navigate(`/learn/${course.id}`)} className="bg-white px-3 py-2 rounded-xl border border-accent-amber/10 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow">
                    <span className="text-[13px] font-semibold text-charcoal">{lang === 'en' ? course.title_en : course.title_hi || course.title_en}</span>
                    <span className="text-[11px] font-bold text-accent-amber">{t('Start', 'शुरू')} →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Earned Certificates ───────────────────────────────── */}
      {completedCourses.length > 0 && (
        <div className="space-y-2.5 mt-2">
          <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
            <Award size={18} className="text-accent-amber" />
            {t('Earned Certificates', 'अर्जित प्रमाणपत्र')}
          </h3>
          {completedCourses.map((course, idx) => (
            <div
              key={course.id}
              className="bg-gradient-to-r from-primary-green/5 to-accent-amber/5 border border-primary-green/20 rounded-xl p-3.5 flex items-center gap-3 animate-card"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="w-10 h-10 bg-primary-green/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award size={20} className="text-primary-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-charcoal leading-snug truncate">
                  {lang === 'en' ? course.title_en : course.title_hi || course.title_en}
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary-green bg-primary-green/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                ✓ {t('Certified', 'प्रमाणित')}
              </span>
            </div>
          ))}
        </div>
      )}

      {completedCourses.length === 0 && !loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-2">
          <BookOpen size={32} className="text-charcoal/25 mx-auto" />
          <p className="text-sm text-charcoal/50 font-medium">No certificates yet. Complete a module!</p>
          <p className="text-xs text-charcoal/40">अभी तक कोई प्रमाणपत्र नहीं। एक मॉड्यूल पूरा करें!</p>
        </div>
      )}

      {/* ── Local Mandi Prices ────────────────────────────────── */}
      <div className="space-y-2.5 pb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-green" />
            {t('Local Mandi Rates', 'स्थानीय मंडी भाव')}
          </h3>
          <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 animate-live">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {t('Live', 'लाइव')}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-t-[3px] border-primary-green">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                  <div className="skeleton h-5 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-light-gray/60">
              {marketPricesData.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-cream/50 transition-colors">
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal leading-tight">
                      {lang === 'en' ? item.crop_en : item.crop_hi || item.crop_en}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-charcoal">{item.price}</span>
                    {item.trend === 'up'
                      ? <TrendingUp size={18} className="text-primary-green" />
                      : <TrendingDown size={18} className="text-red-400" />
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

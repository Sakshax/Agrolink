import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, getJobs } from '../firebase/api';
import { Clock, BookOpen, CheckCircle2, Briefcase, Building2, PlayCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

// ─── Skeleton Card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md space-y-3 animate-card">
      <div className="skeleton w-full h-36 rounded-xl" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-2 w-full rounded-full" />
      <div className="skeleton h-12 w-full rounded-lg" />
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────
export default function CoursesView() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Tab & Filters state
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'my_learning'
  const [activeCategory, setActiveCategory] = useState('All');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const [coursesData, jobsData] = await Promise.all([
      getCourses(),
      getJobs()
    ]);
    
    const jMap = {};
    jobsData.forEach(j => { jMap[j.id] = j; });
    setJobsMap(jMap);
    
    setCourses(coursesData);
    setLoading(false);
  }, []);

  // Re-fetch every time the component mounts (fixes stale data after quiz)
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Derived filtered courses
  const displayedCourses = courses.filter(c => {
    // Filter by Tab
    if (activeTab === 'my_learning' && c.progress === 0) return false;
    // Filter by Category
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    return true;
  });

  const uniqueCategories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <div className="space-y-4 animate-page-enter">
      {/* ── Header & Tabs ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-charcoal">{t('Farmer Training Hub', 'किसान प्रशिक्षण केंद्र')}</h2>
          {activeTab === 'my_learning' && (
            <span className="text-xs bg-primary-green/10 text-primary-green px-2.5 py-1 rounded-full font-semibold">
              {courses.filter(c => c.progress === 100).length} / {courses.filter(c => c.progress > 0).length} {t('Done', 'पूरा हुआ')}
            </span>
          )}
        </div>

        <div className="flex bg-light-gray/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-white text-primary-green shadow-sm' : 'text-charcoal/60'}`}
          >
            {t('Course Catalog', 'कोर्स कैटलॉग')}
          </button>
          <button
            onClick={() => setActiveTab('my_learning')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'my_learning' ? 'bg-white text-primary-green shadow-sm' : 'text-charcoal/60'}`}
          >
            {t('My Learning', 'मेरा शिक्षण')}
          </button>
        </div>
      </div>

      {/* ── Category Filters ───────────────────────────────────── */}
      {activeTab === 'catalog' && uniqueCategories.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-4 px-4">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                activeCategory === cat 
                  ? 'bg-charcoal text-white border-charcoal' 
                  : 'bg-white text-charcoal border-charcoal/10 hover:border-charcoal/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="text-center py-12 text-charcoal/40 bg-white rounded-2xl border border-dashed border-charcoal/20">
          <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-base font-semibold mb-1">No courses found</p>
          <p className="text-sm">यहाँ कोई कोर्स नहीं है</p>
        </div>
      ) : (
        displayedCourses.map((course, idx) => {
          const isCompleted = course.progress >= 100;
          const isStarted = course.progress > 0 && !isCompleted;

          return (
            <div
              key={course.id}
              className="animate-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* ── Thumbnail ────────────────────────────── */}
              <div className="relative w-full h-40 bg-light-gray overflow-hidden group">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/40 font-medium">
                    {course.title_en}
                  </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {course.duration || '15 min'}
                  </span>
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <PlayCircle size={12} /> {course.lessons || 4} {t('modules', 'मॉड्यूल')}
                  </span>
                </div>
                
                {course.institution && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-white/95 backdrop-blur-sm shadow-sm text-charcoal text-[10px] font-extrabold px-2 py-1 rounded-md flex items-center gap-1 border border-white/20">
                      <Building2 size={10} className="text-primary-green" /> {course.institution}
                    </span>
                  </div>
                )}

                {isCompleted && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 animate-success shadow-lg">
                      <CheckCircle2 size={40} className="text-primary-green" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Content ──────────────────────────────── */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-[16px] font-bold text-charcoal leading-snug">
                    {lang === 'en' ? course.title_en : course.title_hi || course.title_en}
                  </h3>
                </div>

                {/* Tags & Difficulty */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    course.difficulty === 'Intermediate'
                      ? 'bg-accent-amber/15 text-accent-amber'
                      : course.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' : 'bg-primary-green/10 text-primary-green'
                  }`}>
                    {course.difficulty || 'Beginner'}
                  </span>
                  {course.category && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-light-gray text-charcoal/60">
                      {course.category}
                    </span>
                  )}
                </div>

                {/* Recommended Jobs */}
                {course.recommendedJobs && course.recommendedJobs.length > 0 && (
                  <div className="mt-2 p-2 bg-light-gray/50 rounded-lg">
                    <p className="text-[11px] font-semibold text-charcoal/50 flex items-center gap-1 mb-1.5">
                      <Briefcase size={12} /> Jobs You'll Be Qualified For:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.recommendedJobs.map(jobId => {
                        const job = jobsMap[jobId];
                        if (!job) return null;
                        return (
                          <span key={jobId} className="text-[10px] font-bold bg-white text-charcoal px-2 py-1 rounded-full border border-charcoal/10 cursor-pointer hover:border-primary-green transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/jobs'); }}>
                            {lang === 'en' ? job.title_en : job.title_hi || job.title_en}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                {course.progress > 0 && (
                  <div className="w-full bg-light-gray h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-primary-green progress-glow' : 'bg-primary-green'}`}
                      style={{ width: `${Math.min(course.progress, 100)}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[12px] text-charcoal/50 font-bold">
                  {course.progress > 0 ? (
                    <span>{Math.min(course.progress, 100)}% {t('complete', 'पूरा')}</span>
                  ) : (
                    <span>{t('Not started', 'शुरू नहीं हुआ')}</span>
                  )}
                  {isCompleted && <span className="text-primary-green">✓ {t('Certified', 'प्रमाणित')}</span>}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/learn/${course.id}`)}
                  className={`w-full h-12 font-bold rounded-xl text-[15px] transition-all duration-200 active:scale-[0.98]
                    ${isCompleted
                      ? 'bg-primary-green/10 text-primary-green shadow-sm hover:bg-primary-green/20'
                      : 'bg-primary-green text-white shadow-sm hover:shadow-md hover:bg-secondary-green'
                    }`}
                >
                  {isCompleted ? t('✅ Review Module', '✅ फिर से देखें') : isStarted ? t('Continue Learning →', 'सीखना जारी रखें →') : t('Start Module →', 'मॉड्यूल शुरू करें →')}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

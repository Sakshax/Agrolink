import React, { useState, useEffect } from 'react';
import { getJobs, getCourses } from '../firebase/api';
import { MapPin, IndianRupee, Search, Mic, BookOpen, Tractor, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

export default function JobsView() {
  const [jobs, setJobs] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      const [jobsData, coursesData] = await Promise.all([
        getJobs(),
        getCourses()
      ]);
      
      const cMap = {};
      coursesData.forEach(c => { cMap[c.id] = c; });
      setCoursesMap(cMap);

      setJobs(jobsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = jobs.filter(j =>
    j.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.title_hi?.includes(searchTerm) ||
    j.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-page-enter">
      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl flex items-center shadow-sm border border-light-gray/60 overflow-hidden">
        <div className="pl-3 text-charcoal/40">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('Search rural jobs...', 'नौकरी खोजें...')}
          className="flex-1 h-12 outline-none px-2.5 text-sm bg-transparent"
        />
        <button className="p-3 text-charcoal/50 hover:text-primary-green transition-colors border-l border-light-gray/60">
          <Mic size={18} />
        </button>
      </div>

      {/* ── Job Cards ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-md space-y-3 animate-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-12 w-full rounded-lg" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-charcoal/40 bg-white rounded-2xl border border-dashed border-charcoal/20">
            <Tractor size={32} className="mx-auto mb-2 opacity-50 text-accent-amber" />
            <p className="text-base font-semibold mb-1">{t('No jobs found', 'कोई नौकरी नहीं मिली')}</p>
          </div>
        ) : (
          filtered.map((job, idx) => (
            <div
              key={job.id}
              className="bg-[#fcfbf9] border-l-4 border-l-accent-amber rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-3 animate-card relative"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Top Pin aesthetic */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-light-gray shadow-inner border border-charcoal/10 mix-blend-multiply opacity-50" />

              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 flex items-start gap-2">
                  <div className="bg-accent-amber/10 p-2 rounded-xl text-accent-amber mt-0.5">
                    <Sprout size={20} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-extrabold text-charcoal leading-snug">
                      {lang === 'en' ? job.title_en : job.title_hi || job.title_en}
                    </h3>
                  </div>
                </div>
                {job.type && (
                  <span className="text-[11px] font-extrabold bg-[#ffe4cc] text-[#b35900] px-2.5 py-1 rounded-full whitespace-nowrap ml-2 shadow-sm border border-[#ffcc99]">
                    {job.type}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px] text-charcoal/55 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {job.distance}
                </span>
                <span>•</span>
                <span>{job.location}</span>
              </div>

              <div className="flex items-center gap-1.5 text-primary-green font-extrabold text-[16px] bg-primary-green/5 w-fit px-3 py-1.5 rounded-xl border border-primary-green/10">
                <IndianRupee size={16} />
                <span>{job.salary?.replace('₹', '')}</span>
                <span className="text-[10px] text-primary-green/70 font-semibold uppercase">{t('Est. Wage', 'अनुमानित वेतन')}</span>
              </div>

              {/* Recommended Courses */}
              {job.recommendedCourses && job.recommendedCourses.length > 0 && (
                <div className="mt-3 p-3 bg-white outline outline-1 outline-black/5 rounded-xl shadow-sm">
                  <p className="text-[11px] font-bold text-charcoal/60 flex items-center gap-1.5 mb-2">
                    <BookOpen size={14} className="text-accent-amber" /> {t('Recommended Courses to Prepare:', 'तैयारी के लिए अनुशंसित कोर्स:')}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {job.recommendedCourses.map(courseId => {
                      const course = coursesMap[courseId];
                      if (!course) return null;
                      return (
                        <div 
                          key={courseId} 
                          onClick={() => navigate(`/learn/${course.id}`)}
                          className="flex items-center justify-between bg-light-gray/30 px-3 py-2 rounded-lg border border-charcoal/5 cursor-pointer hover:bg-light-gray/80 transition-colors group"
                        >
                          <span className="text-[12px] font-bold text-charcoal truncate">
                            {lang === 'en' ? course.title_en : course.title_hi || course.title_en}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-charcoal/40 group-hover:text-primary-green transition-colors">{t('Learn', 'सीखें')} →</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <a
                href={`https://wa.me/${job.whatsappNumber}?text=I am applying for the ${job.title_en} job via Siksha%26Rozgar`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full h-12 bg-[#25D366] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] no-underline border-b-4 border-black/20 pb-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.752-6.278-2.03l-.438-.327-2.644.887.887-2.644-.327-.438A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                {t('Apply via WhatsApp', 'व्हाट्सएप से आवेदन करें')}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

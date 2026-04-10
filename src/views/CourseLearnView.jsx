import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizzesData, coursesData } from '../data/mockData';
import { updateCourseProgress, getCourses } from '../firebase/api';
import { Play, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function CourseLearnView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Resolve course data ───────────────────────────────────────
  const courseId = parseInt(id, 10) || 1;
  const quizBank = quizzesData[courseId] || quizzesData[1];
  const questions = quizBank.questions;

  // ── State ─────────────────────────────────────────────────────
  const [course, setCourse] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load actual course data from backend so we know true progress
  useEffect(() => {
    async function load() {
      const allCourses = await getCourses();
      const found = allCourses.find(c => c.id === courseId);
      setCourse(found || coursesData.find(c => c.id === courseId) || coursesData[0]);
    }
    load();
  }, [courseId]);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="skeleton w-12 h-12 rounded-full"></div>
      </div>
    );
  }

  const question = questions[currentQ];
  const isLastQuestion = currentQ === questions.length - 1;
  const currentOpt = selectedOpt !== null ? question.options[selectedOpt] : null;

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelect = (idx) => {
    if (!isSubmitted) setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || isSubmitted) return;
    setIsSubmitted(true);
    if (currentOpt?.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setFinished(true);
      if (score >= Math.ceil(questions.length / 2)) {
        setIsUpdating(true);
        await updateCourseProgress(courseId, 100);
        setIsUpdating(false);
      }
    } else {
      setCurrentQ(q => q + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  const passed = score >= Math.ceil(questions.length / 2);

  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        const id = parsed.pathname.slice(1).split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/watch')) {
          const id = parsed.searchParams.get('v');
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (parsed.pathname.startsWith('/shorts/')) {
          const id = parsed.pathname.split('/').pop();
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
      }
    } catch (e) {
      // If URL parsing fails, fall back to raw string.
    }
    return url;
  };

  const embedVideoUrl = getEmbedUrl(course.videoUrl);

  // ── Finished screen ───────────────────────────────────────────
  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-page-enter">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center animate-success ${passed ? 'bg-primary-green/15' : 'bg-accent-amber/15'}`}>
          {passed
            ? <CheckCircle2 size={56} className="text-primary-green" />
            : <XCircle size={56} className="text-accent-amber" />}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-charcoal">
            {passed ? '🎉 Skill Unlocked!' : 'Keep Practicing!'}
          </h2>
          <p className="text-charcoal/60 text-sm">
            {passed ? 'कौशल अनलॉक हो गया!' : 'और अभ्यास करें!'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md w-full max-w-xs text-center space-y-2">
          <p className="text-3xl font-bold text-charcoal">{score} / {questions.length}</p>
          <p className="text-sm text-charcoal/60">Questions correct</p>
          <div className="w-full bg-light-gray h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${passed ? 'bg-primary-green' : 'bg-accent-amber'}`}
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {passed ? (
          <button
            onClick={() => navigate('/courses')}
            disabled={isUpdating}
            className="w-full max-w-xs h-14 bg-primary-green text-white font-bold rounded-xl text-base shadow-md hover:bg-secondary-green transition-colors active:scale-[0.98]"
          >
            {isUpdating ? 'Saving…' : 'Return to Courses →'}
          </button>
        ) : (
          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleRetry}
              className="w-full h-14 bg-primary-green text-white font-bold rounded-xl text-base shadow-md hover:bg-secondary-green transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Retry Quiz
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="w-full h-12 border-2 border-charcoal/20 text-charcoal/60 font-semibold rounded-xl text-sm transition-colors hover:border-charcoal/40"
            >
              Back to Courses
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Main quiz flow ────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full space-y-5 animate-page-enter">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-charcoal leading-tight">{quizBank.moduleTitle_en}</h2>
        <p className="text-charcoal/50 text-sm">{quizBank.moduleTitle_hi}</p>
      </div>

      {/* ── Video Section ───────────────────────────────────────── */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md bg-black relative" style={{ aspectRatio: '16/9' }}>
        {showVideo && embedVideoUrl ? (
          <iframe
            src={embedVideoUrl}
            title={course.title_en}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setShowVideo(true)}
          >
            <img
              src={course.videoThumbnailUrl || course.thumbnailUrl}
              alt={course.title_en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="play-btn w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:bg-white transition-colors">
                <Play size={28} className="text-primary-green ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-xs font-semibold opacity-90">▶ Watch lesson video</p>
            </div>
          </div>
        )}
      </div>

      {course.progress >= 100 ? (
        <div className="bg-primary-green/10 p-5 rounded-2xl text-center space-y-3 mt-4 border border-primary-green/20">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-primary-green shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-charcoal text-[15px]">You are certified in this module!</h3>
            <p className="text-sm text-charcoal/60">आप इस मॉड्यूल में प्रमाणित हैं!</p>
          </div>
          <button onClick={() => navigate('/courses')} className="w-full h-12 mt-2 bg-primary-green font-bold text-white rounded-xl shadow-sm hover:bg-secondary-green transition-colors active:scale-[0.98]">
            Return to Courses
          </button>
        </div>
      ) : (
        <>
          {/* ── Question Progress ───────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                  i < currentQ ? 'bg-primary-green' :
                  i === currentQ ? 'bg-primary-green/50' :
                  'bg-light-gray'
                }`}
              />
            ))}
            <span className="text-xs text-charcoal/50 font-semibold ml-1 whitespace-nowrap">
              {currentQ + 1}/{questions.length}
            </span>
          </div>

          {/* ── Question ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-base font-semibold text-charcoal leading-snug">{question.question_en}</h3>
            <p className="text-charcoal/60 text-[13px] mt-0.5">{question.question_hi}</p>
          </div>

          {/* ── Options ─────────────────────────────────────────────── */}
          <div className="space-y-2.5 flex-1">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const showCorrect = isSubmitted && opt.isCorrect;
              const showWrong  = isSubmitted && isSelected && !opt.isCorrect;

              let ringColor = 'border-light-gray';
              let bgColor = 'bg-white';
              if (isSelected && !isSubmitted) { ringColor = 'border-primary-green'; bgColor = 'bg-primary-green/5'; }
              if (showCorrect)               { ringColor = 'border-[#25D366]';      bgColor = 'bg-[#25D366]/10'; }
              if (showWrong)                 { ringColor = 'border-red-400';         bgColor = 'bg-red-50'; }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitted}
                  className={`w-full p-3.5 border-2 rounded-xl flex items-center gap-3 transition-all duration-200 text-left active:scale-[0.98]
                    ${ringColor} ${bgColor} ${isSubmitted ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
                >
                  {/* Radio dot */}
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${isSelected ? 'border-primary-green' : 'border-charcoal/25'}
                    ${showCorrect ? 'border-[#25D366]' : ''}
                    ${showWrong ? 'border-red-400' : ''}
                  `}>
                    {isSelected && (
                      <div className={`w-2.5 h-2.5 rounded-full ${showCorrect ? 'bg-[#25D366]' : showWrong ? 'bg-red-400' : 'bg-primary-green'}`} />
                    )}
                    {showCorrect && !isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[14px] text-charcoal leading-snug">{opt.text_en}</span>
                    <span className="text-[12px] text-charcoal/60">{opt.text_hi}</span>
                  </div>
                  {showCorrect && <CheckCircle2 size={18} className="text-[#25D366] ml-auto flex-shrink-0" />}
                  {showWrong  && <XCircle size={18} className="text-red-400 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* ── Feedback Toast ──────────────────────────────────────── */}
          {isSubmitted && (
            <div className={`rounded-xl p-3 text-center text-sm font-semibold animate-success ${currentOpt?.isCorrect ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-red-50 text-red-500'}`}>
              {currentOpt?.isCorrect ? '✅ Correct! / सही जवाब!' : '❌ Wrong answer / गलत जवाब'}
            </div>
          )}

          {/* ── Action Button ───────────────────────────────────────── */}
          <div className="pt-1 pb-4">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOpt === null}
                className={`w-full h-14 font-bold rounded-xl text-base transition-all duration-200 active:scale-[0.98]
                  ${selectedOpt !== null
                    ? 'bg-primary-green text-white shadow-md hover:bg-secondary-green'
                    : 'bg-light-gray text-charcoal/35 cursor-not-allowed'}`}
              >
                Submit Answer / उत्तर जमा करें
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full h-14 bg-primary-green text-white font-bold rounded-xl text-base shadow-md hover:bg-secondary-green transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLastQuestion ? 'See Results' : 'Next Question'}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

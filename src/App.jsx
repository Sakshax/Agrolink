import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import CoursesView from './views/CoursesView';
import JobsView from './views/JobsView';
import ProfileView from './views/ProfileView';
import CourseLearnView from './views/CourseLearnView';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="max-w-[480px] mx-auto h-[100dvh] relative bg-cream shadow-2xl overflow-hidden flex flex-col">
          <TopAppBar />

          <div className="flex-1 overflow-y-auto w-full p-4 pb-24 no-scrollbar">
            <Routes>
              <Route path="/" element={<Navigate to="/courses" replace />} />
              <Route path="/courses" element={<CoursesView />} />
              <Route path="/jobs" element={<JobsView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/learn/:id" element={<CourseLearnView />} />
              {/* Legacy route redirect */}
              <Route path="/quiz/:id" element={<Navigate to="/learn/:id" replace />} />
            </Routes>
          </div>

          {/* Hide bottom nav on learn/quiz pages */}
          <Routes>
            <Route path="/learn/:id" element={null} />
            <Route path="/quiz/:id" element={null} />
            <Route path="*" element={<BottomNavBar />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ModalLayer } from '../components/ModalLayer';
import { useApp } from './AppState';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FeedPage } from '../pages/FeedPage';
import { ForumPage } from '../pages/ForumPage';
import { GradesPage } from '../pages/GradesPage';
import { LandingPage } from '../pages/LandingPage';
import { MessagesPage } from '../pages/MessagesPage';
import { MissionsPage } from '../pages/MissionsPage';
import { NoticesPage } from '../pages/NoticesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { QuizPage } from '../pages/QuizPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TasksPage } from '../pages/TasksPage';

export function App() {
  const { currentUser } = useApp();

  return (
    <HashRouter>
      {currentUser ? (
        <>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/feed" replace />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/feed" replace />} />
            </Route>
          </Routes>
          <ModalLayer />
        </>
      ) : (
        <LandingPage />
      )}
    </HashRouter>
  );
}

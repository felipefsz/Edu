import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ModalLayer } from '../components/ModalLayer';
import { useApp } from './AppState';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { FeedPage } from '../pages/FeedPage';
import { LandingPage } from '../pages/LandingPage';
import { MessagesPage } from '../pages/MessagesPage';
import { ProfilePage } from '../pages/ProfilePage';
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
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
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

import {
  BarChart3,
  Bell,
  Globe2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoonStar,
  Settings,
  SunMedium,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { buildNavigation } from '../utils/selectors';
import { NotificationBell } from './NotificationBell';
import { SearchBar } from './SearchBar';
import { useApp } from '../app/AppState';

const iconMap = {
  feed: LayoutDashboard,
  messages: MessageSquare,
  tasks: Bell,
  analytics: BarChart3,
  settings: Settings,
};

export function AppLayout() {
  const {
    currentRole,
    currentUser,
    logout,
    openModal,
    state,
    t,
    toggleLanguage,
    toggleTheme,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTopButton, setShowTopButton] = useState(false);
  const navigation = buildNavigation(currentUser);

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(window.scrollY > 260);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-title">{t('appName')}</div>
          <div className="brand-subtitle">{t('appSubtitle')}</div>
        </div>

        <div className="sidebar-section-label">
          {currentRole === 'teacher' ? t('teacherMode') : t('studentMode')}
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = iconMap[item.key];
            return (
              <NavLink
                key={item.key}
                to={`/${item.key}`}
                className={({ isActive }) =>
                  isActive ? 'nav-button nav-button--active' : 'nav-button'
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card__eyebrow">Session</div>
          <button
            className="profile-chip"
            type="button"
            onClick={() => navigate(`/profile/${currentUser?.id}`)}
          >
            <span className="avatar-pill" style={{ background: currentUser?.avatarTone }}>
              {currentUser?.name.slice(0, 1)}
            </span>
            <span>
              <strong>{currentUser?.name}</strong>
              <small>{currentUser?.role === 'teacher' ? 'Teacher' : `Class ${currentUser?.classroom}`}</small>
            </span>
          </button>
          <button className="ghost-button ghost-button--full" type="button" onClick={logout}>
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-title">
            <div className="topbar-title__eyebrow">
              {currentRole === 'teacher' ? t('teacherMode') : t('studentMode')}
            </div>
            <div className="topbar-title__headline">
              {location.pathname.includes('/messages')
                ? t('messagesHeadline')
                : location.pathname.includes('/tasks')
                  ? t('tasksHeadline')
                  : location.pathname.includes('/analytics')
                    ? t('analyticsHeadline')
                    : location.pathname.includes('/settings')
                      ? t('settingsHeadline')
                      : t('feedHeadline')}
            </div>
          </div>

          <div className="topbar-actions">
            <SearchBar />
            <NotificationBell />
            <button className="toolbar-button" type="button" onClick={toggleTheme} title={t('theme')}>
              {state.preferences.theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
            <button className="toolbar-button toolbar-button--text" type="button" onClick={toggleLanguage} title={t('language')}>
              <Globe2 size={16} />
              <span>{state.preferences.language === 'pt' ? 'EN' : 'PT'}</span>
            </button>
            <button
              className="toolbar-button"
              type="button"
              onClick={() => openModal({ type: 'profilePreview', userId: currentUser?.id ?? 'teacher' })}
              title={t('profile')}
            >
              <UserRound size={16} />
            </button>
          </div>
        </header>

        <main className="page-shell">
          <Outlet />
        </main>

        <nav className="mobile-nav">
          {navigation.map((item) => {
            const Icon = iconMap[item.key];
            return (
              <NavLink
                key={item.key}
                to={`/${item.key}`}
                className={({ isActive }) =>
                  isActive ? 'mobile-nav__item mobile-nav__item--active' : 'mobile-nav__item'
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {showTopButton && !state.ui.modal ? (
        <button
          className="floating-top-button"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}

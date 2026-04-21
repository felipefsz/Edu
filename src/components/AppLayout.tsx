import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Compass,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  MoonStar,
  NotebookTabs,
  Settings,
  SunMedium,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { buildNavigation } from '../utils/selectors';
import { NotificationBell } from './NotificationBell';
import { SearchBar } from './SearchBar';
import { useApp } from '../app/AppState';

const iconMap = {
  feed: LayoutDashboard,
  explore: Compass,
  messages: MessageSquare,
  tasks: Bell,
  grades: BookOpenCheck,
  calendar: CalendarDays,
  missions: Trophy,
  notices: Megaphone,
  forum: NotebookTabs,
  quiz: HelpCircle,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = buildNavigation(currentUser);

  const renderSidebarContent = (isDrawer = false) => (
    <>
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
              onClick={() => isDrawer && setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-button nav-button--active' : 'nav-button'
              }
            >
              <Icon size={17} />
              <span>{t(item.key)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <div className="sidebar-card__eyebrow">{state.preferences.language === 'en' ? 'Session' : 'Sessao'}</div>
        <button
          className="profile-chip"
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            navigate(`/profile/${currentUser?.id}`);
          }}
        >
          <span className="avatar-pill" style={{ background: currentUser?.avatarTone }}>
            {currentUser?.name.slice(0, 1)}
          </span>
          <span>
            <strong>{currentUser?.name}</strong>
            <small>{currentUser?.role === 'teacher' ? t('teacherLabel') : `${t('classLabel')} ${currentUser?.classroom}`}</small>
          </span>
        </button>
        <button className="ghost-button ghost-button--full" type="button" onClick={logout}>
          <LogOut size={16} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </>
  );

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(window.scrollY > 260);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {renderSidebarContent()}
      </aside>

      {sidebarOpen ? (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label={state.preferences.language === 'en' ? 'Close menu' : 'Fechar menu'}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {sidebarOpen ? (
        <aside className="mobile-sidebar mobile-sidebar--open" aria-label={state.preferences.language === 'en' ? 'Main menu' : 'Menu principal'}>
          <div className="mobile-sidebar__top">
            <span>{t('appName')}</span>
            <button className="toolbar-button toolbar-button--icon" type="button" onClick={() => setSidebarOpen(false)}>
              <X size={16} />
            </button>
          </div>
          {renderSidebarContent(true)}
        </aside>
      ) : null}

      <div className="content-shell">
        <header className="topbar">
          <button
            className="toolbar-button toolbar-button--icon menu-toggle"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={state.preferences.language === 'en' ? 'Open menu' : 'Abrir menu'}
          >
            <Menu size={17} />
          </button>
          <div className="topbar-title">
            <div className="topbar-title__eyebrow">
              {currentRole === 'teacher' ? t('teacherMode') : t('studentMode')}
            </div>
            <div className="topbar-title__headline">
              {location.pathname.includes('/messages')
                ? t('messagesHeadline')
                : location.pathname.includes('/explore')
                  ? t('exploreHeadline')
                : location.pathname.includes('/tasks')
                  ? t('tasksHeadline')
                  : location.pathname.includes('/grades')
                    ? t('gradesHeadline')
                    : location.pathname.includes('/calendar')
                      ? t('calendarHeadline')
                      : location.pathname.includes('/missions')
                        ? t('missionsHeadline')
                        : location.pathname.includes('/notices')
                          ? t('noticesHeadline')
                          : location.pathname.includes('/forum')
                            ? t('forumHeadline')
                            : location.pathname.includes('/quiz')
                              ? t('quizHeadline')
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
              <span>{state.preferences.language === 'pt' ? 'PT' : 'EN'}</span>
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
                <span>{t(item.key)}</span>
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
          ^
        </button>
      ) : null}
    </div>
  );
}

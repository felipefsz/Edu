import { Bell } from 'lucide-react';
import { useApp } from '../app/AppState';
import { getUnreadNotificationsCount } from '../utils/selectors';

export function NotificationBell() {
  const { currentUser, openModal, state, t } = useApp();
  const unreadCount = getUnreadNotificationsCount(state, currentUser);

  return (
    <button className="toolbar-button toolbar-button--with-badge" type="button" onClick={() => openModal({ type: 'notifications' })} title={t('notifications')}>
      <Bell size={16} />
      {unreadCount ? <span className="notification-bubble">{unreadCount}</span> : null}
    </button>
  );
}

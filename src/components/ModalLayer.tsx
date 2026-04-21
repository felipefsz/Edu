import { ArrowLeft, Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppState';
import {
  formatRelativeDate,
  getNotificationsForUser,
  getPostById,
  getProfilePosts,
  getUnreadNotificationsCount,
  getUserById,
} from '../utils/selectors';
import { PostCard } from './PostCard';

export function ModalLayer() {
  const {
    closeModal,
    createQuotePost,
    currentUser,
    markNotificationsSeen,
    state,
    t,
    updateGroup,
  } = useApp();
  const navigate = useNavigate();
  const modal = state.ui.modal;
  const unreadCount = getUnreadNotificationsCount(state, currentUser);
  const [quoteBody, setQuoteBody] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [studentsCanPost, setStudentsCanPost] = useState(true);
  const [membersVisibleToStudents, setMembersVisibleToStudents] = useState(true);

  useEffect(() => {
    if (modal?.type === 'notifications' && unreadCount > 0) {
      markNotificationsSeen();
    }
  }, [markNotificationsSeen, modal?.type, unreadCount]);

  useEffect(() => {
    if (!modal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  useEffect(() => {
    if (modal?.type === 'quoteComposer') {
      setQuoteBody('');
    }
    if (modal?.type === 'groupEditor') {
      const group = state.chatGroups.find((item) => item.id === modal.groupId);
      if (group) {
        setGroupTitle(group.title);
        setGroupDescription(group.description);
        setStudentsCanPost(group.permissions.studentsCanPost);
        setMembersVisibleToStudents(group.permissions.membersVisibleToStudents);
      }
    }
  }, [modal, state.chatGroups]);

  if (!modal) return null;

  if (modal.type === 'notifications') {
    const notifications = getNotificationsForUser(state, currentUser);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--narrow modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">{t('notifications')}</div>
              <h2 className="modal-title">
                {state.preferences.language === 'en' ? `Inbox / ${unreadCount}` : `Caixa / ${unreadCount}`}
              </h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body stack-gap">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="notification-card"
                onClick={() => {
                  closeModal();
                  if (notification.targetPage === 'profile' && notification.targetId) {
                    navigate(`/profile/${notification.targetId}`);
                    return;
                  }
                  if (notification.targetId && notification.targetPage === 'messages') {
                    navigate('/messages');
                    return;
                  }
                  navigate(`/${notification.targetPage}`);
                }}
              >
                <strong>{notification.message}</strong>
                <small>{formatRelativeDate(notification.createdAt)}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'postDetails') {
    const post = getPostById(state, modal.postId);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--wide modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">
                {state.preferences.language === 'en' ? 'Post details' : 'Detalhes da publicacao'}
              </div>
              <h2 className="modal-title">
                {state.preferences.language === 'en' ? 'Conversation thread' : 'Conversa da publicacao'}
              </h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body stack-gap">
            {post ? (
              <PostCard post={post} forceComments />
            ) : (
              <div className="empty-panel">
                {state.preferences.language === 'en' ? 'Post not found.' : 'Publicacao nao encontrada.'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'quoteComposer') {
    const sourcePost = getPostById(state, modal.sourcePostId);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--wide modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">{t('quote')}</div>
              <h2 className="modal-title">
                {state.preferences.language === 'en' ? 'Write your context' : 'Escreva seu contexto'}
              </h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body stack-gap">
            {sourcePost ? <PostCard post={sourcePost} compact /> : null}
            <label className="field-label" htmlFor="quote-body">
              {state.preferences.language === 'en' ? 'Your comment' : 'Seu comentario'}
            </label>
            <textarea
              id="quote-body"
              value={quoteBody}
              onChange={(event) => setQuoteBody(event.target.value)}
              className="ui-textarea"
              rows={5}
              placeholder={
                state.preferences.language === 'en'
                  ? 'Add your analysis, context, or recommendation...'
                  : 'Adicione sua analise, contexto ou recomendacao...'
              }
            />
            <div className="button-row button-row--end">
              <button type="button" className="ghost-button" onClick={closeModal}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="solid-button"
                onClick={() => createQuotePost(modal.sourcePostId, quoteBody)}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'groupEditor') {
    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--narrow modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">
                {state.preferences.language === 'en' ? 'Group management' : 'Gestao do grupo'}
              </div>
              <h2 className="modal-title">
                {state.preferences.language === 'en' ? 'Edit group details' : 'Editar detalhes do grupo'}
              </h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body stack-gap">
            <label className="field-label" htmlFor="group-title">
              Title
            </label>
            <input id="group-title" className="ui-input" value={groupTitle} onChange={(event) => setGroupTitle(event.target.value)} />

            <label className="field-label" htmlFor="group-description">
              Description
            </label>
            <textarea
              id="group-description"
              className="ui-textarea"
              rows={4}
              value={groupDescription}
              onChange={(event) => setGroupDescription(event.target.value)}
            />

            <label className="checkbox-row" htmlFor="students-can-post">
              <input
                id="students-can-post"
                type="checkbox"
                checked={studentsCanPost}
                onChange={(event) => setStudentsCanPost(event.target.checked)}
              />
              <span>{state.preferences.language === 'en' ? 'Students can publish' : 'Alunos podem publicar'}</span>
            </label>

            <label className="checkbox-row" htmlFor="members-visible">
              <input
                id="members-visible"
                type="checkbox"
                checked={membersVisibleToStudents}
                onChange={(event) => setMembersVisibleToStudents(event.target.checked)}
              />
              <span>
                {state.preferences.language === 'en'
                  ? 'Members visible to students'
                  : 'Membros visiveis para alunos'}
              </span>
            </label>

            <div className="button-row button-row--end">
              <button type="button" className="ghost-button" onClick={closeModal}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="solid-button"
                onClick={() =>
                  updateGroup(modal.groupId, {
                    title: groupTitle,
                    description: groupDescription,
                    permissions: {
                      teacherCanEdit: true,
                      studentsCanPost,
                      membersVisibleToStudents,
                    },
                  })
                }
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileUser = getUserById(state, modal.userId);
  const posts = getProfilePosts(state, modal.userId);
  const previewPosts = posts.slice(0, 3);

  return (
    <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
      <div className="modal-panel modal-panel--wide modal-panel--scale" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header modal-header--sticky">
          <div>
            <div className="modal-eyebrow">{t('profile')}</div>
            <h2 className="modal-title">{profileUser?.name}</h2>
          </div>
          <div className="modal-actions-right">
            <button
              type="button"
              className="toolbar-button toolbar-button--icon"
              onClick={() => {
                closeModal();
                navigate(`/profile/${profileUser?.id}`);
              }}
              title={t('openProfile')}
            >
              <Expand size={16} />
            </button>
            <button
              type="button"
              className="toolbar-button toolbar-button--icon"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  closeModal();
                }
              }}
              title={t('back')}
            >
              <ArrowLeft size={16} />
            </button>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body stack-gap">
          <section className="profile-hero">
            <span className="profile-hero__avatar" style={{ background: profileUser?.avatarTone ?? '#6374f6' }}>
              {profileUser?.name.slice(0, 1)}
            </span>
            <div>
              <div className="profile-hero__name">{profileUser?.name}</div>
              <div className="profile-hero__meta">
                {profileUser?.role === 'teacher' ? 'Teacher' : `Class ${profileUser?.classroom ?? '-'}`}
              </div>
              <p className="profile-hero__bio">{profileUser?.bio}</p>
              <div className="profile-hero__status">{profileUser?.status}</div>
            </div>
          </section>

          <section className="profile-preview-posts">
            {previewPosts.map((post, index) => (
              <div
                key={post.id}
                className={index > 0 ? 'profile-preview-post profile-preview-post--extra' : 'profile-preview-post'}
              >
                <PostCard post={post} compact />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

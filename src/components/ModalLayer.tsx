import { ArrowLeft, Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppState';
import {
  formatRelativeDate,
  getCalendarItems,
  getNotificationsForUser,
  getPostById,
  getProfilePosts,
  getTaskSubmission,
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
    openModal,
    replyForumTopic,
    reviewTaskSubmission,
    state,
    submitTask,
    t,
    toggleForumResolved,
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
  const [taskNote, setTaskNote] = useState('');
  const [taskAttachments, setTaskAttachments] = useState('');
  const [taskReviewDrafts, setTaskReviewDrafts] = useState<Record<string, { feedback: string; score: string }>>({});
  const [forumReplyDraft, setForumReplyDraft] = useState('');

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
    if (modal?.type === 'taskDetails') {
      const task = state.tasks.find((item) => item.id === modal.taskId);
      const submission = task ? getTaskSubmission(task, currentUser?.id) : null;
      setTaskNote(submission?.note ?? '');
      setTaskAttachments(submission?.attachments.join(', ') ?? '');
      setTaskReviewDrafts({});
    }
    if (modal?.type === 'forumTopic') {
      setForumReplyDraft('');
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
  }, [currentUser?.id, modal, state.chatGroups, state.tasks]);

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

  if (modal.type === 'taskDetails') {
    const task = state.tasks.find((item) => item.id === modal.taskId);
    const submission = task ? getTaskSubmission(task, currentUser?.id) : null;
    const isTeacher = currentUser?.role === 'teacher';

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--wide modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">{state.preferences.language === 'en' ? 'Task detail' : 'Detalhe da tarefa'}</div>
              <h2 className="modal-title">{task?.title ?? (state.preferences.language === 'en' ? 'Task not found' : 'Tarefa nao encontrada')}</h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>

          {task ? (
            <div className="modal-body stack-gap">
              <section className="modal-summary-grid">
                <div className="list-card">
                  <strong>{state.preferences.language === 'en' ? 'Subject' : 'Materia'}</strong>
                  <small>{task.subject}</small>
                </div>
                <div className="list-card">
                  <strong>{state.preferences.language === 'en' ? 'Deadline' : 'Prazo'}</strong>
                  <small>{task.deadline}</small>
                </div>
                <div className="list-card">
                  <strong>{state.preferences.language === 'en' ? 'Audience' : 'Publico'}</strong>
                  <small>{task.classroom ? `Turma ${task.classroom}` : state.preferences.language === 'en' ? 'All classes' : 'Todas as turmas'}</small>
                </div>
              </section>
              <p className="modal-rich-text">{task.description}</p>

              {task.attachments.length ? (
                <div className="tag-list">
                  {task.attachments.map((attachment) => (
                    <span className="tag-pill" key={attachment}>{attachment}</span>
                  ))}
                </div>
              ) : null}

              {isTeacher ? (
                <section className="submission-list">
                  {task.submissions.length ? task.submissions.map((item) => {
                    const student = getUserById(state, item.userId);
                    const draft = taskReviewDrafts[item.userId] ?? {
                      feedback: item.feedback ?? '',
                      score: item.score?.toString() ?? '',
                    };
                    return (
                      <div className="submission-card submission-card--rich" key={item.userId}>
                        <strong>{student?.name ?? item.userId}</strong>
                        <small>{item.status} {item.submittedAt ? `· ${formatRelativeDate(item.submittedAt)}` : ''}</small>
                        <p>{item.note || (state.preferences.language === 'en' ? 'No note yet.' : 'Sem observacao ainda.')}</p>
                        <div className="tag-list">
                          {item.attachments.map((attachment) => (
                            <span className="tag-pill" key={attachment}>{attachment}</span>
                          ))}
                        </div>
                        <textarea
                          className="ui-textarea"
                          rows={3}
                          placeholder={state.preferences.language === 'en' ? 'Feedback for the student' : 'Feedback para o aluno'}
                          value={draft.feedback}
                          onChange={(event) => setTaskReviewDrafts((current) => ({
                            ...current,
                            [item.userId]: { ...draft, feedback: event.target.value },
                          }))}
                        />
                        <input
                          className="ui-input"
                          placeholder={state.preferences.language === 'en' ? 'Score' : 'Nota'}
                          value={draft.score}
                          onChange={(event) => setTaskReviewDrafts((current) => ({
                            ...current,
                            [item.userId]: { ...draft, score: event.target.value },
                          }))}
                        />
                        <div className="button-row button-row--end">
                          <button
                            className="solid-button"
                            type="button"
                            onClick={() => reviewTaskSubmission(
                              task.id,
                              item.userId,
                              draft.feedback,
                              draft.score ? Number(draft.score) : undefined,
                            )}
                          >
                            {state.preferences.language === 'en' ? 'Save review' : 'Salvar revisao'}
                          </button>
                        </div>
                      </div>
                    );
                  }) : <div className="empty-panel">{state.preferences.language === 'en' ? 'No submissions yet.' : 'Nenhuma entrega ainda.'}</div>}
                </section>
              ) : (
                <section className="submission-editor">
                  <div className="task-student-meta">
                    <span className="status-pill">{submission?.status ?? 'pending'}</span>
                    {submission?.score !== undefined ? <span className="status-pill">Nota {submission.score}</span> : null}
                  </div>
                  <textarea
                    className="ui-textarea"
                    rows={4}
                    placeholder={state.preferences.language === 'en' ? 'Write your delivery note' : 'Escreva sua observacao da entrega'}
                    value={taskNote}
                    onChange={(event) => setTaskNote(event.target.value)}
                  />
                  <input
                    className="ui-input"
                    placeholder={state.preferences.language === 'en' ? 'Attachments or links, comma separated' : 'Anexos ou links, separados por virgula'}
                    value={taskAttachments}
                    onChange={(event) => setTaskAttachments(event.target.value)}
                  />
                  {submission?.feedback ? (
                    <div className="list-card">
                      <strong>{state.preferences.language === 'en' ? 'Teacher feedback' : 'Feedback do professor'}</strong>
                      <small>{submission.feedback}</small>
                    </div>
                  ) : null}
                  <div className="button-row button-row--end">
                    <button
                      className="solid-button"
                      type="button"
                      onClick={() => submitTask(
                        task.id,
                        taskNote,
                        taskAttachments.split(',').map((item) => item.trim()).filter(Boolean),
                      )}
                    >
                      {state.preferences.language === 'en' ? 'Send delivery' : 'Enviar entrega'}
                    </button>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="empty-panel">{state.preferences.language === 'en' ? 'This task no longer exists.' : 'Esta tarefa nao existe mais.'}</div>
          )}
        </div>
      </div>
    );
  }

  if (modal.type === 'noticeDetails') {
    const notice = state.notices.find((item) => item.id === modal.noticeId);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--narrow modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">{state.preferences.language === 'en' ? 'Notice' : 'Aviso'}</div>
              <h2 className="modal-title">{notice?.title ?? (state.preferences.language === 'en' ? 'Notice not found' : 'Aviso nao encontrado')}</h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>
          {notice ? (
            <div className="modal-body stack-gap">
              <p className="modal-rich-text">{notice.body}</p>
              <div className="tag-list">
                {notice.classroom ? <span className="tag-pill">Turma {notice.classroom}</span> : <span className="tag-pill">{state.preferences.language === 'en' ? 'All classes' : 'Todas as turmas'}</span>}
                {notice.pinned ? <span className="status-pill">{t('pinned')}</span> : null}
                <span className="status-pill">{formatRelativeDate(notice.createdAt)}</span>
              </div>
            </div>
          ) : (
            <div className="empty-panel">{state.preferences.language === 'en' ? 'This notice no longer exists.' : 'Este aviso nao existe mais.'}</div>
          )}
        </div>
      </div>
    );
  }

  if (modal.type === 'calendarDay') {
    const dayItems = getCalendarItems(state, currentUser).filter((item) => item.date === modal.date);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--narrow modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">{state.preferences.language === 'en' ? 'Day agenda' : 'Agenda do dia'}</div>
              <h2 className="modal-title">{new Date(`${modal.date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body stack-gap">
            {dayItems.length ? dayItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="list-card list-card--button"
                onClick={() =>
                  item.type === 'task'
                    ? openModal({ type: 'taskDetails', taskId: item.id.replace('task-', '') })
                    : openModal({ type: 'noticeDetails', noticeId: item.id.replace('notice-', '') })
                }
              >
                <span className={item.type === 'task' ? 'status-pill' : 'tag-pill'}>{item.type === 'task' ? 'Tarefa' : 'Aviso'}</span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </button>
            )) : (
              <div className="empty-panel">{state.preferences.language === 'en' ? 'Nothing scheduled for this day.' : 'Nada agendado para este dia.'}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'forumTopic') {
    const topic = state.forumTopics.find((item) => item.id === modal.topicId);
    const author = getUserById(state, topic?.authorId);

    return (
      <div className="modal-backdrop modal-backdrop--fade" onClick={closeModal}>
        <div className="modal-panel modal-panel--wide modal-panel--scale" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header modal-header--sticky">
            <div>
              <div className="modal-eyebrow">Forum</div>
              <h2 className="modal-title">{topic?.title ?? (state.preferences.language === 'en' ? 'Topic not found' : 'Topico nao encontrado')}</h2>
            </div>
            <button type="button" className="toolbar-button toolbar-button--icon" onClick={closeModal} title={t('close')}>
              <X size={16} />
            </button>
          </div>
          {topic ? (
            <div className="modal-body stack-gap">
              <section className="forum-topic-hero">
                <div className="avatar-pill" style={{ background: author?.avatarTone ?? '#6374f6' }}>
                  {author?.name.slice(0, 1) ?? '?'}
                </div>
                <div>
                  <strong>{author?.name ?? topic.authorId}</strong>
                  <p>{topic.body}</p>
                  <div className="tag-list">
                    {topic.tags.map((tag) => <span className="tag-pill" key={tag}>#{tag}</span>)}
                    <span className={topic.resolved ? 'status-pill' : 'status-pill status-pill--accent'}>
                      {topic.resolved ? 'Resolvido' : 'Aberto'}
                    </span>
                  </div>
                </div>
              </section>
              {currentUser?.role === 'teacher' ? (
                <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleForumResolved(topic.id)}>
                  {topic.resolved ? 'Reabrir topico' : 'Marcar como resolvido'}
                </button>
              ) : null}
              <section className="forum-replies">
                {topic.replies.map((reply) => {
                  const replyAuthor = getUserById(state, reply.authorId);
                  return (
                    <div className="comment-row" key={reply.id}>
                      <strong>{replyAuthor?.name ?? reply.authorId}</strong>
                      <small>{formatRelativeDate(reply.createdAt)}</small>
                      <p>{reply.body}</p>
                    </div>
                  );
                })}
              </section>
              <div className="comment-composer">
                <input
                  value={forumReplyDraft}
                  placeholder={state.preferences.language === 'en' ? 'Write a reply...' : 'Escreva uma resposta...'}
                  onChange={(event) => setForumReplyDraft(event.target.value)}
                />
                <button
                  className="solid-button"
                  type="button"
                  onClick={() => {
                    replyForumTopic(topic.id, forumReplyDraft);
                    setForumReplyDraft('');
                  }}
                >
                  {state.preferences.language === 'en' ? 'Reply' : 'Responder'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-panel">{state.preferences.language === 'en' ? 'This topic no longer exists.' : 'Este topico nao existe mais.'}</div>
          )}
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

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useApp } from '../app/AppState';
import type { User } from '../app/types';
import {
  formatRelativeDate,
  getThreadById,
  getThreadMembers,
  getThreadSummaries,
  getUserById,
  isGroupThread,
} from '../utils/selectors';

export function MessagesPage() {
  const { currentRole, currentUser, openModal, selectThread, sendMessage, state } = useApp();
  const [messageBody, setMessageBody] = useState('');
  const summaries = getThreadSummaries(state, currentUser);
  const activeThread = getThreadById(state, state.ui.activeThreadId);
  const members = getThreadMembers(state, state.ui.activeThreadId);
  const isEnglish = state.preferences.language === 'en';

  const sendCurrentMessage = () => {
    if (!activeThread) return;
    sendMessage(activeThread.id, messageBody);
    setMessageBody('');
  };

  useEffect(() => {
    if (!state.ui.activeThreadId && summaries.length) {
      selectThread(summaries[0].id);
    }
  }, [selectThread, state.ui.activeThreadId, summaries]);

  return (
    <div className="page-grid page-grid--messages">
      <section className="panel-card">
        <div className="panel-card__eyebrow">{isEnglish ? 'Threads' : 'Conversas'}</div>
        <div className="thread-list">
          {summaries.map((summary) => (
            <button
              key={summary.id}
              type="button"
              className={summary.id === state.ui.activeThreadId ? 'thread-item thread-item--active' : 'thread-item'}
              onClick={() => selectThread(summary.id)}
            >
              <strong>{summary.title}</strong>
              <small>{summary.subtitle}</small>
              {summary.unreadCount ? <span className="status-pill status-pill--accent">{summary.unreadCount}</span> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-card panel-card--conversation">
        <div className="conversation-header">
          <div>
            <div className="panel-card__eyebrow">{isEnglish ? 'Conversation' : 'Conversa'}</div>
            <h2 className="conversation-title">
              {isGroupThread(activeThread)
                ? activeThread.title
                : summaries.find((item) => item.id === activeThread?.id)?.title}
            </h2>
            <p className="muted-copy">
              {isGroupThread(activeThread)
                ? activeThread.description
                : summaries.find((item) => item.id === activeThread?.id)?.subtitle}
            </p>
          </div>
          {isGroupThread(activeThread) && currentRole === 'teacher' ? (
            <button className="toolbar-button" type="button" onClick={() => openModal({ type: 'groupEditor', groupId: activeThread.id })}>
              <Settings2 size={16} />
            </button>
          ) : null}
        </div>

        <div className="message-stream">
          {activeThread && activeThread.messages.length ? (
            activeThread.messages.map((message) => {
              const author = getUserById(state, message.authorId);
              const sentByCurrentUser = author?.id === currentUser?.id;
              return (
                <article
                  key={message.id}
                  className={sentByCurrentUser ? 'message-bubble message-bubble--self' : 'message-bubble'}
                >
                  <strong>{author?.name}</strong>
                  <p>{message.body}</p>
                  {message.attachments.length ? (
                    <div className="tag-list">
                      {message.attachments.map((attachment) => (
                        <span key={attachment.id} className="tag-pill">
                          {attachment.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <small>{formatRelativeDate(message.createdAt)}</small>
                </article>
              );
            })
          ) : (
            <div className="empty-panel">{isEnglish ? 'Select a conversation to start.' : 'Selecione uma conversa para comecar.'}</div>
          )}
        </div>

        <div className="composer-inline">
          <input
            className="ui-input"
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendCurrentMessage();
              }
            }}
            placeholder={isEnglish ? 'Write a message...' : 'Escreva uma mensagem...'}
          />
          <button
            className="solid-button"
            type="button"
            onClick={sendCurrentMessage}
          >
            {isEnglish ? 'Send' : 'Enviar'}
          </button>
        </div>
      </section>

      <aside className="panel-card">
        <div className="panel-card__eyebrow">{isEnglish ? 'Group visibility' : 'Visibilidade do grupo'}</div>
        {isGroupThread(activeThread) ? (
          <>
            <div className="stack-gap-sm">
              <div className="status-pill">
                {activeThread.permissions.studentsCanPost
                  ? isEnglish ? 'Students can post' : 'Alunos podem publicar'
                  : isEnglish ? 'Teacher-only posting' : 'Apenas professor publica'}
              </div>
              <div className="status-pill">
                {activeThread.permissions.membersVisibleToStudents
                  ? isEnglish ? 'Members visible' : 'Membros visiveis'
                  : isEnglish ? 'Members hidden for students' : 'Membros ocultos para alunos'}
              </div>
            </div>
            {currentRole === 'teacher' || activeThread.permissions.membersVisibleToStudents ? (
              <div className="member-list">
                {members.map((member: User) => (
                  <button key={member.id} className="person-row" type="button" onClick={() => openModal({ type: 'profilePreview', userId: member.id })}>
                    <span className="avatar-pill" style={{ background: member.avatarTone }}>
                      {member.name.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{member.name}</strong>
                      <small>{member.role === 'teacher' ? (isEnglish ? 'Can edit' : 'Pode editar') : (isEnglish ? 'Read / participate' : 'Le / participa')}</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="muted-copy">{isEnglish ? 'The teacher hid the member list for this group.' : 'O professor ocultou a lista de membros deste grupo.'}</div>
            )}
          </>
        ) : (
          <div className="muted-copy">
            {isEnglish ? 'Direct thread with' : 'Conversa direta com'} {members.find((member: User) => member.id !== currentUser?.id)?.name ?? (isEnglish ? 'student' : 'aluno')}.
          </div>
        )}
      </aside>
    </div>
  );
}

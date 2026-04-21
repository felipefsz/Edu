import { useState } from 'react';
import { useApp } from '../app/AppState';
import { formatRelativeDate, getUserById, getVisibleForumTopics } from '../utils/selectors';

export function ForumPage() {
  const {
    createForumTopic,
    currentRole,
    currentUser,
    openModal,
    replyForumTopic,
    state,
    toggleForumResolved,
  } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const topics = getVisibleForumTopics(state, currentUser);
  const [topicForm, setTopicForm] = useState({
    title: '',
    body: '',
    classroom: currentUser?.classroom ?? '',
    tags: '',
  });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Forum' : 'Forum'}</div>
          <h1 className="hero-panel__title">
            {isEnglish
              ? 'Turn questions into shared answers, with teacher moderation and student collaboration.'
              : 'Transforme duvidas em respostas compartilhadas, com moderacao do professor e colaboracao dos alunos.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'Inspired by Reddit: topics, tags, replies, and resolved state without leaving the school context.'
              : 'Inspirado no Reddit: topicos, tags, respostas e estado resolvido sem sair do contexto escolar.'}
          </p>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__eyebrow">{isEnglish ? 'New topic' : 'Novo topico'}</div>
        <div className="form-grid">
          <input
            className="ui-input"
            placeholder={isEnglish ? 'Topic title' : 'Titulo do topico'}
            value={topicForm.title}
            onChange={(event) => setTopicForm((current) => ({ ...current, title: event.target.value }))}
          />
          <input
            className="ui-input"
            placeholder={isEnglish ? 'Classroom' : 'Turma'}
            value={topicForm.classroom}
            onChange={(event) => setTopicForm((current) => ({ ...current, classroom: event.target.value }))}
          />
          <textarea
            className="ui-textarea"
            rows={4}
            placeholder={isEnglish ? 'Describe the question with context...' : 'Descreva a duvida com contexto...'}
            value={topicForm.body}
            onChange={(event) => setTopicForm((current) => ({ ...current, body: event.target.value }))}
          />
          <input
            className="ui-input"
            placeholder={isEnglish ? 'Tags, comma separated' : 'Tags, separadas por virgula'}
            value={topicForm.tags}
            onChange={(event) => setTopicForm((current) => ({ ...current, tags: event.target.value }))}
          />
        </div>
        <div className="button-row button-row--end">
          <button
            className="solid-button"
            type="button"
            onClick={() => {
              createForumTopic({
                title: topicForm.title,
                body: topicForm.body,
                classroom: topicForm.classroom || undefined,
                tags: topicForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
              });
              setTopicForm({ title: '', body: '', classroom: currentUser?.classroom ?? '', tags: '' });
            }}
          >
            {isEnglish ? 'Publish topic' : 'Publicar topico'}
          </button>
        </div>
      </section>

      <section className="forum-list">
        {topics.map((topic) => {
          const author = getUserById(state, topic.authorId);
          return (
            <article className="forum-card" key={topic.id}>
              <div className="forum-card__header">
                <div>
                  <div className="panel-card__eyebrow">
                    {topic.classroom ? `${isEnglish ? 'Class' : 'Turma'} ${topic.classroom}` : isEnglish ? 'General' : 'Geral'}
                  </div>
                  <h2>{topic.title}</h2>
                  <small>
                    {author?.name ?? topic.authorId} · {formatRelativeDate(topic.createdAt)}
                  </small>
                </div>
                <div className="toolbar-cluster">
                  <span className={topic.resolved ? 'status-pill' : 'status-pill status-pill--accent'}>
                    {topic.resolved ? (isEnglish ? 'Resolved' : 'Resolvido') : (isEnglish ? 'Open' : 'Aberto')}
                  </span>
                  <button className="ghost-button ghost-button--slim" type="button" onClick={() => openModal({ type: 'forumTopic', topicId: topic.id })}>
                    {isEnglish ? 'Open' : 'Abrir'}
                  </button>
                  {currentRole === 'teacher' ? (
                    <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleForumResolved(topic.id)}>
                      {topic.resolved ? (isEnglish ? 'Reopen' : 'Reabrir') : (isEnglish ? 'Resolve' : 'Resolver')}
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="forum-card__body">{topic.body}</p>
              <div className="tag-list">
                {topic.tags.map((tag) => (
                  <span className="tag-pill" key={tag}>#{tag}</span>
                ))}
              </div>

              <div className="forum-replies">
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
              </div>

              <div className="comment-composer">
                <input
                  value={replyDrafts[topic.id] ?? ''}
                  placeholder={isEnglish ? 'Write a reply...' : 'Escreva uma resposta...'}
                  onChange={(event) => setReplyDrafts((current) => ({ ...current, [topic.id]: event.target.value }))}
                />
                <button
                  className="solid-button"
                  type="button"
                  onClick={() => {
                    replyForumTopic(topic.id, replyDrafts[topic.id] ?? '');
                    setReplyDrafts((current) => ({ ...current, [topic.id]: '' }));
                  }}
                >
                  {isEnglish ? 'Reply' : 'Responder'}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

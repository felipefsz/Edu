import { useState } from 'react';
import { MetricTile } from '../components/ChartBlocks';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import {
  getFeedPosts,
  getFollowSuggestions,
  getNoticeHighlights,
  getOpenMissions,
  getRelevantNotices,
  getStudentOverview,
  getTopStudents,
  getTrendingTags,
  getUpcomingTasks,
} from '../utils/selectors';

export function FeedPage() {
  const {
    createNotice,
    createPost,
    currentRole,
    currentUser,
    openModal,
    state,
    toggleFollow,
    t,
  } = useApp();
  const [postBody, setPostBody] = useState('');
  const [pinPost, setPinPost] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    body: '',
    classroom: '',
    pinned: false,
  });
  const posts = getFeedPosts(state);
  const trendingTags = getTrendingTags(state);
  const missions = getOpenMissions(state, currentUser);
  const studentOverview = getStudentOverview(state, currentUser);
  const followSuggestions = getFollowSuggestions(state, currentUser);
  const topStudents = getTopStudents(state);
  const noticeHighlights = getRelevantNotices(state, currentUser).slice(0, 3);
  const allNoticeHighlights = getNoticeHighlights(state).slice(0, 2);
  const upcomingTasks = getUpcomingTasks(state, currentUser);
  const isEnglish = state.preferences.language === 'en';

  return (
    <div className="page-grid page-grid--feed">
      <section className="stack-gap">
        <div className="hero-panel hero-panel--feed">
          <div>
            <div className="panel-card__eyebrow">
              {currentRole === 'teacher'
                ? isEnglish ? 'Teacher pulse' : 'Pulso do professor'
                : isEnglish ? 'Student rhythm' : 'Ritmo do aluno'}
            </div>
            <h1 className="hero-panel__title">
              {currentRole === 'teacher'
                ? isEnglish
                  ? 'Run the school social layer with context, notices, and teaching signals.'
                  : 'Conduza a camada social da escola com contexto, avisos e sinais de ensino.'
                : isEnglish
                  ? 'Keep your study flow visible, social, and connected to what matters this week.'
                  : 'Mantenha seu fluxo de estudos visivel, social e conectado ao que importa nesta semana.'}
            </h1>
            <p className="hero-panel__copy">
              {currentRole === 'teacher'
                ? isEnglish
                  ? 'Blend posts, class notices, and academic action from the same surface.'
                  : 'Misture posts, avisos de turma e acao academica na mesma superficie.'
                : isEnglish
                  ? 'See notices, tasks, saved content, and your social learning loop in one feed.'
                  : 'Veja avisos, tarefas, conteudo salvo e seu ciclo social de aprendizagem no mesmo feed.'}
            </p>
          </div>

          <div className="metric-grid">
            {currentRole === 'teacher' ? (
              <>
                <MetricTile label={isEnglish ? 'Posts in motion' : 'Posts em movimento'} value={posts.length} accent="blue" />
                <MetricTile label={isEnglish ? 'Unread inbox' : 'Caixa nao lida'} value={state.notifications.length} accent="yellow" />
                <MetricTile label={isEnglish ? 'Active tasks' : 'Tarefas ativas'} value={state.tasks.length} accent="green" />
                <MetricTile label={isEnglish ? 'Live groups' : 'Grupos ativos'} value={state.chatGroups.length} accent="pink" />
              </>
            ) : (
              <>
                <MetricTile label={isEnglish ? 'Average grade' : 'Media geral'} value={studentOverview?.averageGrade.toFixed(1) ?? '0.0'} accent="blue" />
                <MetricTile label={isEnglish ? 'Saved posts' : 'Posts salvos'} value={studentOverview?.savedPostCount ?? 0} accent="green" />
                <MetricTile label={isEnglish ? 'Unread chats' : 'Conversas nao lidas'} value={studentOverview?.unreadMessages ?? 0} accent="yellow" />
                <MetricTile label={isEnglish ? 'Streak' : 'Sequencia'} value={currentUser?.streak ?? 0} accent="pink" />
              </>
            )}
          </div>
        </div>

        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Composer' : 'Composer social'}</div>
          <div className="composer-card">
            <textarea
              className="ui-textarea"
              rows={4}
              value={postBody}
              onChange={(event) => setPostBody(event.target.value)}
              placeholder={
                currentRole === 'teacher'
                  ? isEnglish
                    ? 'Share guidance, context, or a school-wide update...'
                    : 'Compartilhe orientacoes, contexto ou um aviso geral da escola...'
                  : isEnglish
                    ? 'Share a study update, a question, or something useful...'
                    : 'Compartilhe um update de estudo, uma pergunta ou algo util...'
              }
            />
            <div className="composer-card__actions">
              {currentRole === 'teacher' ? (
                <label className="checkbox-row" htmlFor="pin-post">
                  <input
                    id="pin-post"
                    type="checkbox"
                    checked={pinPost}
                    onChange={(event) => setPinPost(event.target.checked)}
                  />
                  <span>{isEnglish ? 'Pin on top' : 'Fixar no topo'}</span>
                </label>
              ) : (
                <div className="tag-hint">
                  {isEnglish ? 'Use hashtags like #math #review #studygroup' : 'Use hashtags como #matematica #revisao #grupoDeEstudo'}
                </div>
              )}
              <button
                className="solid-button"
                type="button"
                onClick={() => {
                  createPost(postBody, { pinned: pinPost });
                  setPostBody('');
                  setPinPost(false);
                }}
              >
                {isEnglish ? 'Publish' : 'Publicar'}
              </button>
            </div>
          </div>
        </section>

        {currentRole === 'teacher' ? (
          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Academic bulletin' : 'Boletim academico'}</div>
            <div className="form-grid">
              <input
                className="ui-input"
                value={noticeForm.title}
                placeholder={isEnglish ? 'Notice title' : 'Titulo do aviso'}
                onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))}
              />
              <input
                className="ui-input"
                value={noticeForm.classroom}
                placeholder={isEnglish ? 'Classroom or leave empty' : 'Turma ou deixe vazio'}
                onChange={(event) => setNoticeForm((current) => ({ ...current, classroom: event.target.value }))}
              />
              <textarea
                className="ui-textarea"
                rows={4}
                value={noticeForm.body}
                placeholder={isEnglish ? 'Write the update, next step, or guidance...' : 'Escreva o aviso, proximo passo ou orientacao...'}
                onChange={(event) => setNoticeForm((current) => ({ ...current, body: event.target.value }))}
              />
            </div>
            <div className="composer-card__actions">
              <label className="checkbox-row" htmlFor="pin-notice">
                <input
                  id="pin-notice"
                  type="checkbox"
                  checked={noticeForm.pinned}
                  onChange={(event) => setNoticeForm((current) => ({ ...current, pinned: event.target.checked }))}
                />
                <span>{isEnglish ? 'Pin notice in the feed' : 'Fixar aviso no feed'}</span>
              </label>
              <button
                className="solid-button"
                type="button"
                onClick={() => {
                  createNotice({
                    title: noticeForm.title,
                    body: noticeForm.body,
                    classroom: noticeForm.classroom || undefined,
                    pinned: noticeForm.pinned,
                  });
                  setNoticeForm({ title: '', body: '', classroom: '', pinned: false });
                }}
              >
                {isEnglish ? 'Publish notice' : 'Publicar aviso'}
              </button>
            </div>
          </section>
        ) : null}

        <section className="stack-gap">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </section>

      <aside className="stack-gap">
        <section className="panel-card">
          <div className="panel-card__eyebrow">
            {currentRole === 'teacher'
              ? isEnglish ? 'Social radar' : 'Radar social'
              : isEnglish ? 'Weekly focus' : 'Foco da semana'}
          </div>
          {currentRole === 'teacher' ? (
            <div className="stack-gap-sm">
              {trendingTags.slice(0, 4).map((trend) => (
                <button key={trend.tag} type="button" className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{isEnglish ? `${trend.count} posts in the stream` : `${trend.count} posts em circulacao`}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="stack-gap-sm">
              {missions.length ? (
                missions.slice(0, 3).map((mission) => (
                  <div key={mission.id} className="list-card">
                    <strong>{mission.label}</strong>
                    <small>{mission.xp} XP</small>
                  </div>
                ))
              ) : (
                <div className="muted-copy">{isEnglish ? 'All missions for this cycle are already done.' : 'Todas as missoes deste ciclo ja foram concluidas.'}</div>
              )}
            </div>
          )}
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Notice board' : 'Quadro de avisos'}</div>
          <div className="stack-gap-sm">
            {noticeHighlights.map((notice) => (
              <div key={notice.id} className="list-card list-card--notice">
                <strong>{notice.title}</strong>
                <small>{notice.body}</small>
                <div className="tag-list">
                  {notice.classroom ? <span className="tag-pill">{t('classLabel')} {notice.classroom}</span> : null}
                  {notice.pinned ? <span className="status-pill">{t('pinned')}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">
            {currentRole === 'teacher'
              ? isEnglish ? 'Published notices' : 'Avisos publicados'
              : isEnglish ? 'Next tasks' : 'Proximas tarefas'}
          </div>
          <div className="stack-gap-sm">
            {currentRole === 'teacher'
              ? allNoticeHighlights.map((notice) => (
                  <div key={notice.id} className="list-card">
                    <strong>{notice.title}</strong>
                    <small>{notice.body}</small>
                  </div>
                ))
              : upcomingTasks.map((task) => (
                  <div key={task.id} className="list-card">
                    <strong>{task.title}</strong>
                    <small>{task.subject} / {task.deadline}</small>
                  </div>
                ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'People to follow' : 'Pessoas para seguir'}</div>
          <div className="stack-gap-sm">
            {followSuggestions.map((user) => (
              <div key={user.id} className="person-stack">
                <button
                  type="button"
                  className="person-row"
                  onClick={() => openModal({ type: 'profilePreview', userId: user.id })}
                >
                  <span className="avatar-pill" style={{ background: user.avatarTone }}>
                    {user.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.classroom ? `${t('classLabel')} ${user.classroom}` : t('teacherLabel')}</small>
                  </span>
                </button>
                <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleFollow(user.id)}>
                  {isEnglish ? 'Follow' : 'Seguir'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Top students' : 'Top alunos'}</div>
          <div className="stack-gap-sm">
            {topStudents.map((user, index) => (
              <div key={user.id} className="person-row person-row--static">
                <span className="rank-pill">{index + 1}</span>
                <span className="avatar-pill" style={{ background: user.avatarTone }}>
                  {user.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.classroom ? `${t('classLabel')} ${user.classroom}` : isEnglish ? 'Student' : 'Aluno'}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

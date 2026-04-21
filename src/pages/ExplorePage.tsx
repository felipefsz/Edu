import { useNavigate } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import {
  getFeedPosts,
  getFollowSuggestions,
  getTopStudents,
  getTrendingTags,
} from '../utils/selectors';

export function ExplorePage() {
  const { currentUser, openModal, setSearchQuery, state, toggleFollow } = useApp();
  const navigate = useNavigate();
  const isEnglish = state.preferences.language === 'en';
  const trends = getTrendingTags(state);
  const suggestions = getFollowSuggestions(state, currentUser);
  const topStudents = getTopStudents(state);
  const hotPosts = getFeedPosts(state)
    .slice()
    .sort((left, right) => (
      right.likeUserIds.length + right.comments.length + right.repostUserIds.length
    ) - (
      left.likeUserIds.length + left.comments.length + left.repostUserIds.length
    ))
    .slice(0, 2);

  return (
    <div className="page-grid page-grid--feed">
      <section className="stack-gap">
        <section className="hero-panel">
          <div>
            <div className="panel-card__eyebrow">{isEnglish ? 'Discovery' : 'Descoberta'}</div>
            <h1 className="hero-panel__title">
              {isEnglish
                ? 'Find people, trends, useful posts, and active learning spaces.'
                : 'Encontre pessoas, tendencias, posts uteis e espacos ativos de aprendizagem.'}
            </h1>
            <p className="hero-panel__copy">
              {isEnglish
                ? 'This brings back the old Explore feeling with cleaner React data and ranked recommendations.'
                : 'Esta pagina recupera a ideia do Explorar do HTML, agora com dados React mais limpos e recomendacoes ordenadas.'}
            </p>
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Trending now' : 'Tendencias agora'}</div>
          <div className="explore-grid">
            {trends.map((trend) => (
              <button
                className="explore-card"
                key={trend.tag}
                type="button"
                onClick={() => {
                  setSearchQuery(`#${trend.tag}`);
                  navigate('/feed');
                }}
              >
                <span>#{trend.tag}</span>
                <strong>{trend.count}</strong>
                <small>{isEnglish ? 'mentions in the feed' : 'mencoes no feed'}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="stack-gap">
          {hotPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </section>

      <aside className="stack-gap">
        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'People to follow' : 'Pessoas para seguir'}</div>
          <div className="stack-gap-sm">
            {suggestions.map((user) => (
              <div className="person-stack" key={user.id}>
                <button
                  className="person-row"
                  type="button"
                  onClick={() => openModal({ type: 'profilePreview', userId: user.id })}
                >
                  <span className="avatar-pill" style={{ background: user.avatarTone }}>
                    {user.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.classroom ? `Turma ${user.classroom}` : 'Professor'}</small>
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
          <div className="panel-card__eyebrow">{isEnglish ? 'Learning leaders' : 'Lideres de aprendizagem'}</div>
          <div className="stack-gap-sm">
            {topStudents.map((student, index) => (
              <button
                className="person-row"
                key={student.id}
                type="button"
                onClick={() => openModal({ type: 'profilePreview', userId: student.id })}
              >
                <span className="rank-pill">{index + 1}</span>
                <span className="avatar-pill" style={{ background: student.avatarTone }}>
                  {student.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{student.name}</strong>
                  <small>{isEnglish ? `Level ${student.level}` : `Nivel ${student.level}`} · {student.xp} XP</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import { getAverageGrade, getProfilePosts, getUserById } from '../utils/selectors';

type ProfileTab = 'posts' | 'saved' | 'followers' | 'following' | 'badges';

export function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, openModal, state, toggleFollow } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const profileUser = getUserById(state, userId);
  const posts = getProfilePosts(state, userId);
  const isOwnProfile = currentUser?.id === profileUser?.id;
  const isFollowing = Boolean(profileUser && currentUser?.followingIds.includes(profileUser.id));
  const isEnglish = state.preferences.language === 'en';

  if (!profileUser) {
    return <div className="panel-card">{isEnglish ? 'User not found.' : 'Usuario nao encontrado.'}</div>;
  }

  const savedPosts = state.posts.filter((post) => post.savedByUserIds.includes(profileUser.id));
  const followerUsers = profileUser.followerIds
    .map((id) => getUserById(state, id))
    .filter(Boolean);
  const followingUsers = profileUser.followingIds
    .map((id) => getUserById(state, id))
    .filter(Boolean);
  const tabItems: Array<{ id: ProfileTab; label: string; count: number }> = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'saved', label: isEnglish ? 'Saved' : 'Salvos', count: savedPosts.length },
    { id: 'followers', label: isEnglish ? 'Followers' : 'Seguidores', count: followerUsers.length },
    { id: 'following', label: isEnglish ? 'Following' : 'Seguindo', count: followingUsers.length },
    { id: 'badges', label: isEnglish ? 'Achievements' : 'Conquistas', count: profileUser.badges.length },
  ];

  const renderPeople = (users: typeof followerUsers) => (
    <div className="stack-gap-sm">
      {users.length ? users.map((user) => user ? (
        <button key={user.id} className="person-row" type="button" onClick={() => openModal({ type: 'profilePreview', userId: user.id })}>
          <span className="avatar-pill" style={{ background: user.avatarTone }}>{user.name.slice(0, 1)}</span>
          <span>
            <strong>{user.name}</strong>
            <small>{user.role === 'teacher' ? (isEnglish ? 'Teacher' : 'Professor') : `${isEnglish ? 'Class' : 'Turma'} ${user.classroom}`}</small>
          </span>
        </button>
      ) : null) : <div className="empty-panel">{isEnglish ? 'Nothing to show yet.' : 'Nada para mostrar ainda.'}</div>}
    </div>
  );

  return (
    <div className="stack-gap">
      <section className="profile-page-hero">
        <div className="profile-page-hero__cover" />
        <div className="profile-page-hero__content">
          <span className="profile-page-hero__avatar" style={{ background: profileUser.avatarTone }}>
            {profileUser.name.slice(0, 1)}
          </span>
          <div className="profile-page-hero__main">
            <div className="profile-page-hero__topline">
              <div>
                <div className="panel-card__eyebrow">
                  {profileUser.role === 'teacher'
                    ? isEnglish ? 'Teacher profile' : 'Perfil do professor'
                    : `${isEnglish ? 'Class' : 'Turma'} ${profileUser.classroom}`}
                </div>
                <h1>{profileUser.name}</h1>
              </div>
              {!isOwnProfile ? (
                <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleFollow(profileUser.id)}>
                  {isFollowing ? (isEnglish ? 'Following' : 'Seguindo') : (isEnglish ? 'Follow' : 'Seguir')}
                </button>
              ) : null}
            </div>
            <p>{profileUser.bio}</p>
            <div className="profile-page-hero__stats">
              <span className="status-pill">{isEnglish ? 'Average' : 'Media'} {getAverageGrade(profileUser).toFixed(1)}</span>
              <span className="status-pill">{isEnglish ? 'Streak' : 'Sequencia'} {profileUser.streak}</span>
              <span className="status-pill">{isEnglish ? 'Level' : 'Nivel'} {profileUser.level}</span>
              <span className="status-pill">XP {profileUser.xp}</span>
            </div>
            <div className="profile-inline-metrics">
              <div>
                <strong>{profileUser.followerIds.length}</strong>
                <small>{isEnglish ? 'Followers' : 'Seguidores'}</small>
              </div>
              <div>
                <strong>{profileUser.followingIds.length}</strong>
                <small>{isEnglish ? 'Following' : 'Seguindo'}</small>
              </div>
              <div>
                <strong>{posts.length}</strong>
                <small>Posts</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card profile-tabs">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'profile-tab profile-tab--active' : 'profile-tab'}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tab.count}</small>
          </button>
        ))}
      </section>

      <section className="page-grid page-grid--feed">
        <div className="stack-gap">
          {activeTab === 'posts' && (posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <div className="panel-card">{isEnglish ? 'No posts yet.' : 'Nenhum post ainda.'}</div>)}
          {activeTab === 'saved' && (savedPosts.length ? savedPosts.map((post) => <PostCard key={post.id} post={post} />) : <div className="panel-card">{isEnglish ? 'No saved posts yet.' : 'Nenhum post salvo ainda.'}</div>)}
          {activeTab === 'followers' ? renderPeople(followerUsers) : null}
          {activeTab === 'following' ? renderPeople(followingUsers) : null}
          {activeTab === 'badges' ? (
            <section className="badge-grid">
              {profileUser.badges.length ? profileUser.badges.map((badge) => (
                <button key={badge} className="badge-card" type="button">
                  <strong>{badge}</strong>
                  <small>{isEnglish ? 'Achievement unlocked in the social journey.' : 'Conquista desbloqueada no percurso social.'}</small>
                </button>
              )) : <div className="empty-panel">{isEnglish ? 'No achievements yet.' : 'Nenhuma conquista ainda.'}</div>}
            </section>
          ) : null}
        </div>
        <aside className="stack-gap">
          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Identity' : 'Identidade'}</div>
            <div className="stack-gap-sm">
              <div className="list-card">
                <strong>Status</strong>
                <small>{profileUser.status}</small>
              </div>
              <div className="list-card">
                <strong>{isEnglish ? 'Role' : 'Papel'}</strong>
                <small>{profileUser.role === 'teacher' ? (isEnglish ? 'Teacher' : 'Professor') : `${isEnglish ? 'Student' : 'Aluno'} · ${isEnglish ? 'Class' : 'Turma'} ${profileUser.classroom}`}</small>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Favorites' : 'Favoritos'}</div>
            <div className="tag-list">
              {profileUser.favoriteSubjects.map((subject) => (
                <span key={subject} className="tag-pill">
                  {subject}
                </span>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Badges' : 'Conquistas'}</div>
            <div className="tag-list">
              {profileUser.badges.map((badge) => (
                <span key={badge} className="status-pill">
                  {badge}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

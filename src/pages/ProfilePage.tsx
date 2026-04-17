import { useParams } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import { getAverageGrade, getProfilePosts, getUserById } from '../utils/selectors';

export function ProfilePage() {
  const { userId } = useParams();
  const { state } = useApp();
  const profileUser = getUserById(state, userId);
  const posts = getProfilePosts(state, userId);

  if (!profileUser) {
    return <div className="panel-card">User not found.</div>;
  }

  return (
    <div className="stack-gap">
      <section className="profile-page-hero">
        <div className="profile-page-hero__cover" />
        <div className="profile-page-hero__content">
          <span className="profile-page-hero__avatar" style={{ background: profileUser.avatarTone }}>
            {profileUser.name.slice(0, 1)}
          </span>
          <div>
            <div className="panel-card__eyebrow">
              {profileUser.role === 'teacher' ? 'Teacher profile' : `Class ${profileUser.classroom}`}
            </div>
            <h1>{profileUser.name}</h1>
            <p>{profileUser.bio}</p>
            <div className="profile-page-hero__stats">
              <span className="status-pill">Average {getAverageGrade(profileUser).toFixed(1)}</span>
              <span className="status-pill">Streak {profileUser.streak}</span>
              <span className="status-pill">Level {profileUser.level}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-grid page-grid--feed">
        <div className="stack-gap">
          {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <div className="panel-card">No posts yet.</div>}
        </div>
        <aside className="panel-card">
          <div className="panel-card__eyebrow">Favorites</div>
          <div className="tag-list">
            {profileUser.favoriteSubjects.map((subject) => (
              <span key={subject} className="tag-pill">
                {subject}
              </span>
            ))}
          </div>
          <div className="panel-card__eyebrow panel-card__eyebrow--spaced">Status</div>
          <div className="muted-copy">{profileUser.status}</div>
        </aside>
      </section>
    </div>
  );
}

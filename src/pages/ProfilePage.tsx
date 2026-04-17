import { useParams } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import { getAverageGrade, getProfilePosts, getUserById } from '../utils/selectors';

export function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, state, toggleFollow } = useApp();
  const profileUser = getUserById(state, userId);
  const posts = getProfilePosts(state, userId);
  const isOwnProfile = currentUser?.id === profileUser?.id;
  const isFollowing = Boolean(profileUser && currentUser?.followingIds.includes(profileUser.id));

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
          <div className="profile-page-hero__main">
            <div className="profile-page-hero__topline">
              <div>
                <div className="panel-card__eyebrow">
                  {profileUser.role === 'teacher' ? 'Teacher profile' : `Class ${profileUser.classroom}`}
                </div>
                <h1>{profileUser.name}</h1>
              </div>
              {!isOwnProfile ? (
                <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleFollow(profileUser.id)}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
            <p>{profileUser.bio}</p>
            <div className="profile-page-hero__stats">
              <span className="status-pill">Average {getAverageGrade(profileUser).toFixed(1)}</span>
              <span className="status-pill">Streak {profileUser.streak}</span>
              <span className="status-pill">Level {profileUser.level}</span>
              <span className="status-pill">XP {profileUser.xp}</span>
            </div>
            <div className="profile-inline-metrics">
              <div>
                <strong>{profileUser.followerIds.length}</strong>
                <small>Followers</small>
              </div>
              <div>
                <strong>{profileUser.followingIds.length}</strong>
                <small>Following</small>
              </div>
              <div>
                <strong>{posts.length}</strong>
                <small>Posts</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-grid page-grid--feed">
        <div className="stack-gap">
          {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <div className="panel-card">No posts yet.</div>}
        </div>
        <aside className="stack-gap">
          <section className="panel-card">
            <div className="panel-card__eyebrow">Identity</div>
            <div className="stack-gap-sm">
              <div className="list-card">
                <strong>Status</strong>
                <small>{profileUser.status}</small>
              </div>
              <div className="list-card">
                <strong>Role</strong>
                <small>{profileUser.role === 'teacher' ? 'Teacher' : `Student · Class ${profileUser.classroom}`}</small>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-card__eyebrow">Favorites</div>
            <div className="tag-list">
              {profileUser.favoriteSubjects.map((subject) => (
                <span key={subject} className="tag-pill">
                  {subject}
                </span>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-card__eyebrow">Badges</div>
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

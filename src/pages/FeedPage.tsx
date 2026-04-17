import { useState } from 'react';
import { MetricTile } from '../components/ChartBlocks';
import { PostCard } from '../components/PostCard';
import { useApp } from '../app/AppState';
import {
  getFeedPosts,
  getFollowSuggestions,
  getOpenMissions,
  getStudentOverview,
  getTopStudents,
  getTrendingTags,
  getNoticeHighlights,
} from '../utils/selectors';

export function FeedPage() {
  const { createPost, currentRole, currentUser, openModal, state } = useApp();
  const [postBody, setPostBody] = useState('');
  const [pinPost, setPinPost] = useState(false);
  const posts = getFeedPosts(state);
  const trendingTags = getTrendingTags(state);
  const missions = getOpenMissions(state, currentUser);
  const studentOverview = getStudentOverview(state, currentUser);
  const followSuggestions = getFollowSuggestions(state, currentUser);
  const topStudents = getTopStudents(state);
  const noticeHighlights = getNoticeHighlights(state).slice(0, 2);

  return (
    <div className="page-grid page-grid--feed">
      <section className="stack-gap">
        <div className="hero-panel">
          <div>
            <div className="panel-card__eyebrow">
              {currentRole === 'teacher' ? 'Teacher pulse' : 'Student rhythm'}
            </div>
            <h1 className="hero-panel__title">
              {currentRole === 'teacher'
                ? 'Run the school community from one surface.'
                : 'Keep your learning loop visible and social.'}
            </h1>
            <p className="hero-panel__copy">
              {currentRole === 'teacher'
                ? 'Track participation, push academic context into the feed, and keep groups aligned.'
                : 'Post progress, save useful content, and keep tasks, groups, and momentum connected.'}
            </p>
          </div>

          <div className="metric-grid">
            {currentRole === 'teacher' ? (
              <>
                <MetricTile label="Posts today" value={posts.length} accent="blue" />
                <MetricTile label="Unread alerts" value={state.notifications.length} accent="yellow" />
                <MetricTile label="Open tasks" value={state.tasks.length} accent="green" />
                <MetricTile label="Active groups" value={state.chatGroups.length} accent="pink" />
              </>
            ) : (
              <>
                <MetricTile label="Average grade" value={studentOverview?.averageGrade.toFixed(1) ?? '0.0'} accent="blue" />
                <MetricTile label="Saved posts" value={studentOverview?.savedPostCount ?? 0} accent="green" />
                <MetricTile label="Unread chats" value={studentOverview?.unreadMessages ?? 0} accent="yellow" />
                <MetricTile label="Streak" value={currentUser?.streak ?? 0} accent="pink" />
              </>
            )}
          </div>
        </div>

        <section className="panel-card">
          <div className="panel-card__eyebrow">Composer</div>
          <div className="composer-card">
            <textarea
              className="ui-textarea"
              rows={4}
              value={postBody}
              onChange={(event) => setPostBody(event.target.value)}
              placeholder={
                currentRole === 'teacher'
                  ? 'Share guidance, context, or a school-wide update...'
                  : 'Share a study update, a question, or something useful...'
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
                  <span>Pin on top</span>
                </label>
              ) : (
                <div className="tag-hint">Use hashtags like #math #review #studygroup</div>
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
                Publish
              </button>
            </div>
          </div>
        </section>

        <section className="stack-gap">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </section>

      <aside className="stack-gap">
        <section className="panel-card">
          <div className="panel-card__eyebrow">
            {currentRole === 'teacher' ? 'Social radar' : 'Weekly focus'}
          </div>
          {currentRole === 'teacher' ? (
            <div className="stack-gap-sm">
              {trendingTags.slice(0, 4).map((trend) => (
                <button key={trend.tag} type="button" className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} posts</small>
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
                <div className="muted-copy">All missions for this cycle are already done.</div>
              )}
            </div>
          )}
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">Notices in feed</div>
          <div className="stack-gap-sm">
            {noticeHighlights.map((notice) => (
              <div key={notice.id} className="list-card">
                <strong>{notice.title}</strong>
                <small>{notice.body}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">People to follow</div>
          <div className="stack-gap-sm">
            {followSuggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                className="person-row"
                onClick={() => openModal({ type: 'profilePreview', userId: user.id })}
              >
                <span className="avatar-pill" style={{ background: user.avatarTone }}>
                  {user.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.classroom ? `Class ${user.classroom}` : user.role}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">Top students</div>
          <div className="stack-gap-sm">
            {topStudents.map((user, index) => (
              <div key={user.id} className="person-row person-row--static">
                <span className="rank-pill">{index + 1}</span>
                <span className="avatar-pill" style={{ background: user.avatarTone }}>
                  {user.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.classroom ? `Class ${user.classroom}` : 'Student'}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

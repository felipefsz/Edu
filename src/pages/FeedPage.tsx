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

  return (
    <div className="page-grid page-grid--feed">
      <section className="stack-gap">
        <div className="hero-panel hero-panel--feed">
          <div>
            <div className="panel-card__eyebrow">
              {currentRole === 'teacher' ? 'Teacher pulse' : 'Student rhythm'}
            </div>
            <h1 className="hero-panel__title">
              {currentRole === 'teacher'
                ? 'Run the school social layer with context, notices, and teaching signals.'
                : 'Keep your study flow visible, social, and connected to what matters this week.'}
            </h1>
            <p className="hero-panel__copy">
              {currentRole === 'teacher'
                ? 'Blend posts, class notices, and academic action from the same surface.'
                : 'See notices, tasks, saved content, and your social learning loop in one feed.'}
            </p>
          </div>

          <div className="metric-grid">
            {currentRole === 'teacher' ? (
              <>
                <MetricTile label="Posts in motion" value={posts.length} accent="blue" />
                <MetricTile label="Unread inbox" value={state.notifications.length} accent="yellow" />
                <MetricTile label="Active tasks" value={state.tasks.length} accent="green" />
                <MetricTile label="Live groups" value={state.chatGroups.length} accent="pink" />
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

        {currentRole === 'teacher' ? (
          <section className="panel-card">
            <div className="panel-card__eyebrow">Academic bulletin</div>
            <div className="form-grid">
              <input
                className="ui-input"
                value={noticeForm.title}
                placeholder="Notice title"
                onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))}
              />
              <input
                className="ui-input"
                value={noticeForm.classroom}
                placeholder="Classroom or leave empty"
                onChange={(event) => setNoticeForm((current) => ({ ...current, classroom: event.target.value }))}
              />
              <textarea
                className="ui-textarea"
                rows={4}
                value={noticeForm.body}
                placeholder="Write the update, next step, or guidance..."
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
                <span>Pin notice in the feed</span>
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
                Publish notice
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
            {currentRole === 'teacher' ? 'Social radar' : 'Weekly focus'}
          </div>
          {currentRole === 'teacher' ? (
            <div className="stack-gap-sm">
              {trendingTags.slice(0, 4).map((trend) => (
                <button key={trend.tag} type="button" className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} posts in the stream</small>
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
          <div className="panel-card__eyebrow">Notice board</div>
          <div className="stack-gap-sm">
            {noticeHighlights.map((notice) => (
              <div key={notice.id} className="list-card list-card--notice">
                <strong>{notice.title}</strong>
                <small>{notice.body}</small>
                <div className="tag-list">
                  {notice.classroom ? <span className="tag-pill">Class {notice.classroom}</span> : null}
                  {notice.pinned ? <span className="status-pill">Pinned</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">
            {currentRole === 'teacher' ? 'Published notices' : 'Next tasks'}
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
                    <small>{task.subject} · {task.deadline}</small>
                  </div>
                ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__eyebrow">People to follow</div>
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
                    <small>{user.classroom ? `Class ${user.classroom}` : user.role}</small>
                  </span>
                </button>
                <button className="ghost-button ghost-button--slim" type="button" onClick={() => toggleFollow(user.id)}>
                  Follow
                </button>
              </div>
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

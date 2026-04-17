import { BarChartCard, MetricTile } from '../components/ChartBlocks';
import { useApp } from '../app/AppState';
import { getStudentOverview, getTeacherAnalytics, getTrendingTags } from '../utils/selectors';

export function AnalyticsPage() {
  const { currentRole, currentUser, state } = useApp();
  const teacherAnalytics = getTeacherAnalytics(state);
  const studentOverview = getStudentOverview(state, currentUser);
  const trends = getTrendingTags(state);

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">Analytics layer</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher'
              ? 'See feed health, task completion, and classroom attention signals together.'
              : 'Track your performance without leaving the product flow.'}
          </h1>
          <p className="hero-panel__copy">
            {currentRole === 'teacher'
              ? 'This page now mixes academic metrics, feed engagement, and students needing attention.'
              : 'Your student analytics stay compact but clear: grades, streak, saved content, and message load.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <>
          <div className="metric-grid">
            <MetricTile label="Total posts" value={teacherAnalytics.totalPosts} accent="blue" />
            <MetricTile label="Active tasks" value={teacherAnalytics.totalTasks} accent="green" />
            <MetricTile label="Notices" value={teacherAnalytics.totalNotices} accent="yellow" />
            <MetricTile label="Students on streak" value={teacherAnalytics.activeStreaks} accent="pink" />
          </div>

          <div className="metric-grid">
            <MetricTile label="Feed interactions" value={teacherAnalytics.totalPostInteractions} accent="blue" />
            <MetricTile label="Avg engagement per post" value={teacherAnalytics.averageEngagementPerPost} accent="green" />
            <MetricTile label="At-risk students" value={teacherAnalytics.atRiskStudents.length} accent="yellow" />
            <MetricTile label="Tracked missions" value={teacherAnalytics.missionCompletion.length} accent="pink" />
          </div>

          <div className="page-grid page-grid--analytics">
            <BarChartCard
              title="Average by classroom"
              rows={teacherAnalytics.classroomAverages.map((row) => ({
                label: row.classroom ?? '-',
                value: row.average,
                max: 10,
              }))}
            />
            <BarChartCard
              title="Task completion"
              rows={teacherAnalytics.taskCompletion.map((row) => ({
                label: row.title,
                value: row.completion,
                max: row.total,
              }))}
            />
          </div>

          <div className="page-grid page-grid--analytics">
            <BarChartCard
              title="Mission completion"
              rows={teacherAnalytics.missionCompletion.map((row) => ({
                label: row.label,
                value: row.completion,
                max: row.total,
              }))}
            />
            <section className="panel-card">
              <div className="panel-card__eyebrow">Students needing attention</div>
              <div className="stack-gap-sm">
                {teacherAnalytics.atRiskStudents.length ? (
                  teacherAnalytics.atRiskStudents.map((student) => (
                    <div key={student.id} className="list-card">
                      <strong>{student.name}</strong>
                      <small>
                        Class {student.classroom ?? '-'} · avg {student.average} · streak {student.streak}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="muted-copy">No student is currently below the attention threshold.</div>
                )}
              </div>
            </section>
          </div>

          <section className="panel-card">
            <div className="panel-card__eyebrow">Trending hashtags</div>
            <div className="stack-gap-sm">
              {trends.slice(0, 5).map((trend) => (
                <div key={trend.tag} className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} mentions in the feed</small>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="metric-grid">
            <MetricTile label="Average grade" value={studentOverview?.averageGrade.toFixed(1) ?? '0.0'} accent="blue" />
            <MetricTile label="Open tasks" value={studentOverview?.openTaskCount ?? 0} accent="green" />
            <MetricTile label="Saved posts" value={studentOverview?.savedPostCount ?? 0} accent="yellow" />
            <MetricTile label="Unread chats" value={studentOverview?.unreadMessages ?? 0} accent="pink" />
          </div>

          <section className="panel-card">
            <div className="panel-card__eyebrow">Study signals</div>
            <div className="stack-gap-sm">
              {trends.slice(0, 3).map((trend) => (
                <div key={trend.tag} className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} conversations around this topic</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

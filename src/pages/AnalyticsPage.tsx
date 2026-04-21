import { BarChartCard, MetricTile } from '../components/ChartBlocks';
import { useApp } from '../app/AppState';
import { getStudentOverview, getTeacherAnalytics, getTrendingTags } from '../utils/selectors';

export function AnalyticsPage() {
  const { currentRole, currentUser, state } = useApp();
  const teacherAnalytics = getTeacherAnalytics(state);
  const studentOverview = getStudentOverview(state, currentUser);
  const trends = getTrendingTags(state);
  const isEnglish = state.preferences.language === 'en';

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Analytics layer' : 'Camada de analytics'}</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher'
              ? isEnglish ? 'See feed health, task completion, and classroom attention signals together.' : 'Veja saude do feed, conclusao de tarefas e sinais de atencao das turmas juntos.'
              : isEnglish ? 'Track your performance without leaving the product flow.' : 'Acompanhe seu desempenho sem sair do fluxo do produto.'}
          </h1>
          <p className="hero-panel__copy">
            {currentRole === 'teacher'
              ? isEnglish ? 'This page now mixes academic metrics, feed engagement, and students needing attention.' : 'Esta pagina mistura metricas academicas, engajamento do feed e alunos que precisam de atencao.'
              : isEnglish ? 'Your student analytics stay compact but clear: grades, streak, saved content, and message load.' : 'Seus analytics ficam compactos e claros: notas, sequencia, salvos e mensagens.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <>
          <div className="metric-grid">
            <MetricTile label={isEnglish ? 'Total posts' : 'Posts totais'} value={teacherAnalytics.totalPosts} accent="blue" />
            <MetricTile label={isEnglish ? 'Active tasks' : 'Tarefas ativas'} value={teacherAnalytics.totalTasks} accent="green" />
            <MetricTile label={isEnglish ? 'Notices' : 'Avisos'} value={teacherAnalytics.totalNotices} accent="yellow" />
            <MetricTile label={isEnglish ? 'Students on streak' : 'Alunos em sequencia'} value={teacherAnalytics.activeStreaks} accent="pink" />
          </div>

          <div className="metric-grid">
            <MetricTile label={isEnglish ? 'Feed interactions' : 'Interacoes do feed'} value={teacherAnalytics.totalPostInteractions} accent="blue" />
            <MetricTile label={isEnglish ? 'Avg engagement per post' : 'Media por post'} value={teacherAnalytics.averageEngagementPerPost} accent="green" />
            <MetricTile label={isEnglish ? 'Forum topics' : 'Topicos no forum'} value={teacherAnalytics.totalForumTopics} accent="yellow" />
            <MetricTile label={isEnglish ? 'Quiz responses' : 'Respostas de quiz'} value={teacherAnalytics.totalQuizResponses} accent="pink" />
          </div>

          <div className="page-grid page-grid--analytics">
            <BarChartCard
              title={isEnglish ? 'Average by classroom' : 'Media por turma'}
              rows={teacherAnalytics.classroomAverages.map((row) => ({
                label: row.classroom ?? '-',
                value: row.average,
                max: 10,
              }))}
            />
            <BarChartCard
              title={isEnglish ? 'Task completion' : 'Conclusao de tarefas'}
              rows={teacherAnalytics.taskCompletion.map((row) => ({
                label: row.title,
                value: row.completion,
                max: row.total,
              }))}
            />
          </div>

          <div className="page-grid page-grid--analytics">
            <BarChartCard
              title={isEnglish ? 'Mission completion' : 'Conclusao de missoes'}
              rows={teacherAnalytics.missionCompletion.map((row) => ({
                label: row.label,
                value: row.completion,
                max: row.total,
              }))}
            />
            <section className="panel-card">
              <div className="panel-card__eyebrow">{isEnglish ? 'Students needing attention' : 'Alunos em atencao'}</div>
              <div className="stack-gap-sm">
                {teacherAnalytics.atRiskStudents.length ? (
                  teacherAnalytics.atRiskStudents.map((student) => (
                    <div key={student.id} className="list-card">
                      <strong>{student.name}</strong>
                      <small>
                        {isEnglish ? 'Class' : 'Turma'} {student.classroom ?? '-'} · {isEnglish ? 'avg' : 'media'} {student.average} · {isEnglish ? 'streak' : 'sequencia'} {student.streak}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="muted-copy">{isEnglish ? 'No student is currently below the attention threshold.' : 'Nenhum aluno esta abaixo do limite de atencao agora.'}</div>
                )}
              </div>
            </section>
          </div>

          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Trending hashtags' : 'Hashtags em alta'}</div>
            <div className="stack-gap-sm">
              {trends.slice(0, 5).map((trend) => (
                <div key={trend.tag} className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} {isEnglish ? 'mentions in the feed' : 'mencoes no feed'}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="metric-grid">
            <MetricTile label={isEnglish ? 'Average grade' : 'Media geral'} value={studentOverview?.averageGrade.toFixed(1) ?? '0.0'} accent="blue" />
            <MetricTile label={isEnglish ? 'Open tasks' : 'Tarefas abertas'} value={studentOverview?.openTaskCount ?? 0} accent="green" />
            <MetricTile label={isEnglish ? 'Saved posts' : 'Posts salvos'} value={studentOverview?.savedPostCount ?? 0} accent="yellow" />
            <MetricTile label={isEnglish ? 'Unread chats' : 'Conversas nao lidas'} value={studentOverview?.unreadMessages ?? 0} accent="pink" />
          </div>

          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Study signals' : 'Sinais de estudo'}</div>
            <div className="stack-gap-sm">
              {trends.slice(0, 3).map((trend) => (
                <div key={trend.tag} className="list-card">
                  <strong>#{trend.tag}</strong>
                  <small>{trend.count} {isEnglish ? 'conversations around this topic' : 'conversas sobre este tema'}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

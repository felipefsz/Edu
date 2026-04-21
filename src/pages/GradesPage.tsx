import { BarChartCard, MetricTile } from '../components/ChartBlocks';
import { useApp } from '../app/AppState';
import { getAverageGrade, getGradeRows, getTopStudents } from '../utils/selectors';

export function GradesPage() {
  const { currentRole, currentUser, state } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const students = state.users.filter((user) => user.role === 'student');
  const topStudents = getTopStudents(state);
  const rows = currentUser?.role === 'student' ? getGradeRows(currentUser) : [];
  const classroomAverages = [...new Set(students.map((student) => student.classroom).filter(Boolean))].map((classroom) => {
    const members = students.filter((student) => student.classroom === classroom);
    const average = members.reduce((total, student) => total + getAverageGrade(student), 0) / Math.max(members.length, 1);
    return { classroom, average: Number(average.toFixed(1)) };
  });

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Gradebook' : 'Boletim'}</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher'
              ? isEnglish ? 'Compare classrooms and spot academic attention points.' : 'Compare turmas e encontre pontos de atencao academica.'
              : isEnglish ? 'Track your grades, goal gaps, and strongest subjects.' : 'Acompanhe suas notas, metas e materias mais fortes.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'This replaces the old grade panel with a focused React screen.'
              : 'Esta tela substitui o painel antigo de boletim com uma experiencia mais clara em React.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <>
          <div className="metric-grid">
            <MetricTile label={isEnglish ? 'Students' : 'Alunos'} value={students.length} accent="blue" />
            <MetricTile label={isEnglish ? 'Classrooms' : 'Turmas'} value={classroomAverages.length} accent="green" />
            <MetricTile label={isEnglish ? 'At risk' : 'Em atencao'} value={students.filter((student) => getAverageGrade(student) < 7).length} accent="yellow" />
            <MetricTile label={isEnglish ? 'Above 8.5' : 'Acima de 8.5'} value={students.filter((student) => getAverageGrade(student) >= 8.5).length} accent="pink" />
          </div>

          <div className="page-grid page-grid--analytics">
            <BarChartCard
              title={isEnglish ? 'Average by classroom' : 'Media por turma'}
              rows={classroomAverages.map((row) => ({ label: `Turma ${row.classroom}`, value: row.average, max: 10 }))}
            />
            <section className="panel-card">
              <div className="panel-card__eyebrow">{isEnglish ? 'Student ranking' : 'Ranking de alunos'}</div>
              <div className="stack-gap-sm">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="person-row person-row--static">
                    <span className="rank-pill">{index + 1}</span>
                    <span className="avatar-pill" style={{ background: student.avatarTone }}>
                      {student.name.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{student.name}</strong>
                      <small>Turma {student.classroom} / media {getAverageGrade(student).toFixed(1)}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="metric-grid">
            <MetricTile label={isEnglish ? 'Average' : 'Media'} value={currentUser ? getAverageGrade(currentUser).toFixed(1) : '0.0'} accent="blue" />
            <MetricTile label={isEnglish ? 'Goal' : 'Meta'} value={currentUser?.goalGrade ?? 0} accent="green" />
            <MetricTile label={isEnglish ? 'Level' : 'Nivel'} value={currentUser?.level ?? 0} accent="yellow" />
            <MetricTile label="XP" value={currentUser?.xp ?? 0} accent="pink" />
          </div>

          <section className="panel-card">
            <div className="panel-card__eyebrow">{isEnglish ? 'Subject performance' : 'Desempenho por materia'}</div>
            <div className="grade-grid">
              {rows.map((row) => (
                <div key={row.subject} className={`grade-card grade-card--${row.status}`}>
                  <strong>{row.subject}</strong>
                  <span>{row.grade.toFixed(1)}</span>
                  <small>
                    {row.gapToGoal >= 0 ? '+' : ''}
                    {row.gapToGoal} {isEnglish ? 'vs goal' : 'vs meta'}
                  </small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

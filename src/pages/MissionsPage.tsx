import { useApp } from '../app/AppState';
import { getMissionsForUser } from '../utils/selectors';

export function MissionsPage() {
  const { completeMission, currentUser, state } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const missions = getMissionsForUser(state, currentUser);
  const completed = missions.filter((mission) => mission.done);

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Missions' : 'Missoes'}</div>
          <h1 className="hero-panel__title">
            {isEnglish ? 'Small goals that keep the learning loop alive.' : 'Pequenas metas que mantem o ciclo de aprendizagem vivo.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'This brings the old achievement feeling into the React experience.'
              : 'Esta tela traz a sensacao de conquistas do HTML para a experiencia React.'}
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <div className="metric-tile metric-tile--blue">
          <small>{isEnglish ? 'Available' : 'Disponiveis'}</small>
          <strong>{missions.length}</strong>
        </div>
        <div className="metric-tile metric-tile--green">
          <small>{isEnglish ? 'Done' : 'Concluidas'}</small>
          <strong>{completed.length}</strong>
        </div>
        <div className="metric-tile metric-tile--yellow">
          <small>XP</small>
          <strong>{completed.reduce((total, mission) => total + mission.xp, 0)}</strong>
        </div>
        <div className="metric-tile metric-tile--pink">
          <small>{isEnglish ? 'Progress' : 'Progresso'}</small>
          <strong>{missions.length ? Math.round((completed.length / missions.length) * 100) : 0}%</strong>
        </div>
      </div>

      <section className="mission-grid">
        {missions.map((mission) => (
          <article key={mission.id} className={mission.done ? 'mission-card mission-card--done' : 'mission-card'}>
            <div>
              <div className="panel-card__eyebrow">{mission.xp} XP</div>
              <h2>{mission.label}</h2>
              <p>{mission.done ? (isEnglish ? 'Mission completed.' : 'Missao concluida.') : (isEnglish ? 'Ready to complete.' : 'Pronta para concluir.')}</p>
            </div>
            <button
              className={mission.done ? 'ghost-button ghost-button--slim' : 'solid-button'}
              type="button"
              disabled={mission.done}
              onClick={() => completeMission(mission.id)}
            >
              {mission.done ? (isEnglish ? 'Completed' : 'Concluida') : (isEnglish ? 'Complete' : 'Concluir')}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useApp } from '../app/AppState';
import { getCalendarItems } from '../utils/selectors';

export function CalendarPage() {
  const { currentUser, state } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const [filter, setFilter] = useState<'all' | 'task' | 'notice'>('all');
  const items = getCalendarItems(state, currentUser);
  const filteredItems = useMemo(
    () => items.filter((item) => filter === 'all' || item.type === filter),
    [filter, items],
  );
  const groupedDays = filteredItems.reduce<Record<string, typeof filteredItems>>((acc, item) => {
    acc[item.date] = [...(acc[item.date] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Calendar' : 'Calendario'}</div>
          <h1 className="hero-panel__title">
            {isEnglish ? 'Deadlines and notices organized by day.' : 'Prazos e avisos organizados por dia.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'A cleaner calendar layer for tasks, notices, and classroom rhythm.'
              : 'Uma camada de calendario mais limpa para tarefas, avisos e ritmo da turma.'}
          </p>
        </div>
      </section>

      <section className="panel-card">
        <div className="toolbar-cluster">
          <button className={filter === 'all' ? 'status-pill' : 'ghost-button ghost-button--slim'} type="button" onClick={() => setFilter('all')}>
            {isEnglish ? 'All' : 'Tudo'}
          </button>
          <button className={filter === 'task' ? 'status-pill' : 'ghost-button ghost-button--slim'} type="button" onClick={() => setFilter('task')}>
            {isEnglish ? 'Tasks' : 'Tarefas'}
          </button>
          <button className={filter === 'notice' ? 'status-pill' : 'ghost-button ghost-button--slim'} type="button" onClick={() => setFilter('notice')}>
            {isEnglish ? 'Notices' : 'Avisos'}
          </button>
        </div>
      </section>

      <section className="calendar-grid">
        {Object.entries(groupedDays).map(([date, dayItems]) => (
          <article key={date} className="panel-card calendar-day-card">
            <div className="calendar-day-card__date">
              <strong>{new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</strong>
              <small>{date}</small>
            </div>
            <div className="stack-gap-sm">
              {dayItems.map((item) => (
                <div key={item.id} className="list-card">
                  <span className={item.type === 'task' ? 'status-pill' : 'tag-pill'}>
                    {item.type === 'task' ? (isEnglish ? 'Task' : 'Tarefa') : (isEnglish ? 'Notice' : 'Aviso')}
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                  {item.classroom ? <small>Turma {item.classroom}</small> : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

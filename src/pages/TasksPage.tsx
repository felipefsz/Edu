import { useMemo, useState } from 'react';
import { useApp } from '../app/AppState';
import { formatRelativeDate, getTaskSubmission, getVisibleTasks } from '../utils/selectors';

export function TasksPage() {
  const {
    createTask,
    currentRole,
    currentUser,
    openModal,
    reviewTaskSubmission,
    state,
    submitTask,
  } = useApp();
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: 'Matematica',
    classroom: '',
    deadline: '',
    description: '',
    attachments: '',
  });
  const [taskFilter, setTaskFilter] = useState({ classroom: 'all', status: 'all' });
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});
  const [submissionAttachments, setSubmissionAttachments] = useState<Record<string, string>>({});
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { feedback: string; score: string }>>({});
  const tasks = getVisibleTasks(state, currentUser);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesClassroom =
        taskFilter.classroom === 'all' || (task.classroom ?? 'general') === taskFilter.classroom;

      if (currentRole === 'teacher') {
        if (taskFilter.status === 'all') return matchesClassroom;
        const hasPending = task.submissions.some((submission) => submission.status === 'submitted');
        const hasReviewed = task.submissions.some((submission) => submission.status === 'reviewed');
        const matchesStatus =
          (taskFilter.status === 'pending-review' && hasPending) ||
          (taskFilter.status === 'reviewed' && hasReviewed);
        return matchesClassroom && matchesStatus;
      }

      const submission = getTaskSubmission(task, currentUser?.id);
      const status = submission?.status ?? 'pending';
      return matchesClassroom && (taskFilter.status === 'all' || taskFilter.status === status);
    });
  }, [currentRole, currentUser?.id, taskFilter.classroom, taskFilter.status, tasks]);

  const classrooms = [...new Set(state.users.map((user) => user.classroom).filter(Boolean))];
  const isEnglish = state.preferences.language === 'en';

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Task board' : 'Quadro de tarefas'}</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher'
              ? isEnglish ? 'Create, review, and close the academic loop.' : 'Crie, revise e feche o ciclo academico.'
              : isEnglish ? 'See deadlines, send deliveries, and track reviews.' : 'Veja prazos, envie entregas e acompanhe revisoes.'}
          </h1>
          <p className="hero-panel__copy">
            {currentRole === 'teacher'
              ? isEnglish ? 'Teacher flow includes creation, classroom targeting, submission visibility, and fast review.' : 'O fluxo do professor inclui criacao, turma alvo, entregas visiveis e revisao rapida.'
              : isEnglish ? 'Student flow keeps deadline, attachments, note, score, and teacher feedback in one place.' : 'O fluxo do aluno junta prazo, anexos, observacao, nota e feedback do professor.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Create task' : 'Criar tarefa'}</div>
          <div className="form-grid">
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Task title' : 'Titulo da tarefa'}
              value={taskForm.title}
              onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Subject' : 'Materia'}
              value={taskForm.subject}
              onChange={(event) => setTaskForm((current) => ({ ...current, subject: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Classroom' : 'Turma'}
              value={taskForm.classroom}
              onChange={(event) => setTaskForm((current) => ({ ...current, classroom: event.target.value }))}
            />
            <input
              className="ui-input"
              type="date"
              value={taskForm.deadline}
              onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))}
            />
            <textarea
              className="ui-textarea"
              rows={4}
              placeholder={isEnglish ? 'Description and rubric' : 'Descricao e criterios'}
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Attachments, comma separated' : 'Anexos, separados por virgula'}
              value={taskForm.attachments}
              onChange={(event) => setTaskForm((current) => ({ ...current, attachments: event.target.value }))}
            />
          </div>
          <div className="button-row button-row--end">
            <button
              className="solid-button"
              type="button"
              onClick={() => {
                createTask({
                  title: taskForm.title,
                  subject: taskForm.subject,
                  classroom: taskForm.classroom || undefined,
                  deadline: taskForm.deadline,
                  description: taskForm.description,
                  attachments: taskForm.attachments
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                });
                setTaskForm({
                  title: '',
                  subject: 'Matematica',
                  classroom: '',
                  deadline: '',
                  description: '',
                  attachments: '',
                });
              }}
            >
              {isEnglish ? 'Save task' : 'Salvar tarefa'}
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel-card">
        <div className="panel-card__eyebrow">{isEnglish ? 'Filters' : 'Filtros'}</div>
        <div className="toolbar-cluster">
          <select
            className="ui-input"
            value={taskFilter.classroom}
            onChange={(event) => setTaskFilter((current) => ({ ...current, classroom: event.target.value }))}
          >
            <option value="all">{isEnglish ? 'All classrooms' : 'Todas as turmas'}</option>
            {classrooms.map((classroom) => (
              <option key={classroom} value={classroom}>
                {isEnglish ? 'Class' : 'Turma'} {classroom}
              </option>
            ))}
            <option value="general">{isEnglish ? 'General' : 'Geral'}</option>
          </select>
          <select
            className="ui-input"
            value={taskFilter.status}
            onChange={(event) => setTaskFilter((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">{isEnglish ? 'All statuses' : 'Todos os status'}</option>
            {currentRole === 'teacher' ? (
              <>
                <option value="pending-review">{isEnglish ? 'Pending review' : 'Revisao pendente'}</option>
                <option value="reviewed">{isEnglish ? 'Reviewed' : 'Revisada'}</option>
              </>
            ) : (
              <>
                <option value="pending">{isEnglish ? 'Pending' : 'Pendente'}</option>
                <option value="submitted">{isEnglish ? 'Submitted' : 'Enviada'}</option>
                <option value="reviewed">{isEnglish ? 'Reviewed' : 'Revisada'}</option>
              </>
            )}
          </select>
        </div>
      </section>

      <section className="task-list">
        {filteredTasks.map((task) => {
          const submission = getTaskSubmission(task, currentUser?.id);
          return (
            <article key={task.id} className="task-card">
              <div className="task-card__header">
                <div>
                  <div className="panel-card__eyebrow">{task.subject}</div>
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                </div>
                <div className="task-card__meta">
                  <span className="status-pill">{isEnglish ? 'Deadline' : 'Prazo'} {task.deadline}</span>
                  <small>{isEnglish ? 'Updated' : 'Atualizada'} {formatRelativeDate(task.updatedAt)}</small>
                  {task.classroom ? <small>{isEnglish ? 'Class' : 'Turma'} {task.classroom}</small> : null}
                  <button
                    className="ghost-button ghost-button--slim"
                    type="button"
                    onClick={() => openModal({ type: 'taskDetails', taskId: task.id, mode: currentRole === 'teacher' ? 'review' : 'submit' })}
                  >
                    {currentRole === 'teacher'
                      ? isEnglish ? 'Open review' : 'Abrir revisao'
                      : isEnglish ? 'Open delivery' : 'Abrir entrega'}
                  </button>
                </div>
              </div>

              {task.attachments.length ? (
                <div className="tag-list">
                  {task.attachments.map((attachment) => (
                    <span key={attachment} className="tag-pill">
                      {attachment}
                    </span>
                  ))}
                </div>
              ) : null}

              {currentRole === 'teacher' ? (
                <div className="submission-list">
                  {task.submissions.length ? (
                    task.submissions.map((item) => {
                      const draft = reviewDrafts[`${task.id}-${item.userId}`] ?? {
                        feedback: item.feedback ?? '',
                        score: item.score?.toString() ?? '',
                      };

                      return (
                        <div key={item.userId} className="submission-card submission-card--rich">
                          <strong>{state.users.find((user) => user.id === item.userId)?.name ?? item.userId}</strong>
                          <small>{item.status}</small>
                          <p>{item.note || (isEnglish ? 'No note yet.' : 'Sem observacao ainda.')}</p>
                          {item.attachments.length ? (
                            <div className="tag-list">
                              {item.attachments.map((attachment) => (
                                <span key={attachment} className="tag-pill">
                                  {attachment}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <textarea
                            className="ui-textarea"
                            rows={3}
                            placeholder={isEnglish ? 'Feedback for the student' : 'Feedback para o aluno'}
                            value={draft.feedback}
                            onChange={(event) =>
                              setReviewDrafts((current) => ({
                                ...current,
                                [`${task.id}-${item.userId}`]: { ...draft, feedback: event.target.value },
                              }))
                            }
                          />
                          <input
                            className="ui-input"
                            placeholder={isEnglish ? 'Score' : 'Nota'}
                            value={draft.score}
                            onChange={(event) =>
                              setReviewDrafts((current) => ({
                                ...current,
                                [`${task.id}-${item.userId}`]: { ...draft, score: event.target.value },
                              }))
                            }
                          />
                          <div className="button-row button-row--end">
                            {item.score !== undefined ? <span className="status-pill">{isEnglish ? 'Score' : 'Nota'} {item.score}</span> : null}
                            <button
                              className="solid-button"
                              type="button"
                              onClick={() =>
                                reviewTaskSubmission(
                                  task.id,
                                  item.userId,
                                  draft.feedback,
                                  draft.score ? Number(draft.score) : undefined,
                                )
                              }
                            >
                              {isEnglish ? 'Save review' : 'Salvar revisao'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-panel">{isEnglish ? 'No submissions yet.' : 'Nenhuma entrega ainda.'}</div>
                  )}
                </div>
              ) : (
                <div className="submission-editor">
                  <div className="task-student-meta">
                    <span className="status-pill">{submission?.status ?? 'pending'}</span>
                    {submission?.score !== undefined ? <span className="status-pill">{isEnglish ? 'Score' : 'Nota'} {submission.score}</span> : null}
                  </div>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder={isEnglish ? 'Write your delivery note' : 'Escreva sua observacao de entrega'}
                    value={submissionNotes[task.id] ?? submission?.note ?? ''}
                    onChange={(event) =>
                      setSubmissionNotes((current) => ({ ...current, [task.id]: event.target.value }))
                    }
                  />
                  <input
                    className="ui-input"
                    placeholder={isEnglish ? 'Attachments or links, comma separated' : 'Anexos ou links, separados por virgula'}
                    value={submissionAttachments[task.id] ?? submission?.attachments.join(', ') ?? ''}
                    onChange={(event) =>
                      setSubmissionAttachments((current) => ({ ...current, [task.id]: event.target.value }))
                    }
                  />
                  {submission?.feedback ? (
                    <div className="list-card">
                      <strong>{isEnglish ? 'Teacher feedback' : 'Feedback do professor'}</strong>
                      <small>{submission.feedback}</small>
                    </div>
                  ) : null}
                  <div className="button-row button-row--end">
                    <button
                      className="solid-button"
                      type="button"
                      onClick={() =>
                        submitTask(
                          task.id,
                          submissionNotes[task.id] ?? submission?.note ?? '',
                          (submissionAttachments[task.id] ?? submission?.attachments.join(', ') ?? '')
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    >
                      {isEnglish ? 'Send delivery' : 'Enviar entrega'}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

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
    subject: 'Math',
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

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">Task board</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher' ? 'Create, review, and close the academic loop.' : 'See deadlines, send deliveries, and track reviews.'}
          </h1>
          <p className="hero-panel__copy">
            {currentRole === 'teacher'
              ? 'Teacher flow includes creation, classroom targeting, submission visibility, and fast review.'
              : 'Student flow keeps deadline, attachments, note, score, and teacher feedback in one place.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <section className="panel-card">
          <div className="panel-card__eyebrow">Create task</div>
          <div className="form-grid">
            <input
              className="ui-input"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Subject"
              value={taskForm.subject}
              onChange={(event) => setTaskForm((current) => ({ ...current, subject: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Classroom"
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
              placeholder="Description and rubric"
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Attachments, comma separated"
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
                  subject: 'Math',
                  classroom: '',
                  deadline: '',
                  description: '',
                  attachments: '',
                });
              }}
            >
              Save task
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel-card">
        <div className="panel-card__eyebrow">Filters</div>
        <div className="toolbar-cluster">
          <select
            className="ui-input"
            value={taskFilter.classroom}
            onChange={(event) => setTaskFilter((current) => ({ ...current, classroom: event.target.value }))}
          >
            <option value="all">All classrooms</option>
            {classrooms.map((classroom) => (
              <option key={classroom} value={classroom}>
                Class {classroom}
              </option>
            ))}
            <option value="general">General</option>
          </select>
          <select
            className="ui-input"
            value={taskFilter.status}
            onChange={(event) => setTaskFilter((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">All statuses</option>
            {currentRole === 'teacher' ? (
              <>
                <option value="pending-review">Pending review</option>
                <option value="reviewed">Reviewed</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
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
                  <span className="status-pill">Deadline {task.deadline}</span>
                  <small>Updated {formatRelativeDate(task.updatedAt)}</small>
                  {task.classroom ? <small>Class {task.classroom}</small> : null}
                  <button
                    className="ghost-button ghost-button--slim"
                    type="button"
                    onClick={() => openModal({ type: 'taskDetails', taskId: task.id, mode: currentRole === 'teacher' ? 'review' : 'submit' })}
                  >
                    {currentRole === 'teacher' ? 'Open review' : 'Open delivery'}
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
                          <p>{item.note || 'No note yet.'}</p>
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
                            placeholder="Feedback for the student"
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
                            placeholder="Score"
                            value={draft.score}
                            onChange={(event) =>
                              setReviewDrafts((current) => ({
                                ...current,
                                [`${task.id}-${item.userId}`]: { ...draft, score: event.target.value },
                              }))
                            }
                          />
                          <div className="button-row button-row--end">
                            {item.score !== undefined ? <span className="status-pill">Score {item.score}</span> : null}
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
                              Save review
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-panel">No submissions yet.</div>
                  )}
                </div>
              ) : (
                <div className="submission-editor">
                  <div className="task-student-meta">
                    <span className="status-pill">{submission?.status ?? 'pending'}</span>
                    {submission?.score !== undefined ? <span className="status-pill">Score {submission.score}</span> : null}
                  </div>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder="Write your delivery note"
                    value={submissionNotes[task.id] ?? submission?.note ?? ''}
                    onChange={(event) =>
                      setSubmissionNotes((current) => ({ ...current, [task.id]: event.target.value }))
                    }
                  />
                  <input
                    className="ui-input"
                    placeholder="Attachments or links, comma separated"
                    value={submissionAttachments[task.id] ?? submission?.attachments.join(', ') ?? ''}
                    onChange={(event) =>
                      setSubmissionAttachments((current) => ({ ...current, [task.id]: event.target.value }))
                    }
                  />
                  {submission?.feedback ? (
                    <div className="list-card">
                      <strong>Teacher feedback</strong>
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
                      Send delivery
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

import { useState } from 'react';
import { useApp } from '../app/AppState';
import { formatRelativeDate, getTaskSubmission, getVisibleTasks } from '../utils/selectors';

export function TasksPage() {
  const { createTask, currentRole, currentUser, state, submitTask } = useApp();
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: 'Math',
    classroom: '',
    deadline: '',
    description: '',
    attachments: '',
  });
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});
  const [submissionAttachments, setSubmissionAttachments] = useState<Record<string, string>>({});
  const tasks = getVisibleTasks(state, currentUser);

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">Task board</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher' ? 'Create, review, and close the academic loop.' : 'See deadlines and submit clean deliveries.'}
          </h1>
          <p className="hero-panel__copy">
            {currentRole === 'teacher'
              ? 'Teacher flow includes task creation, classroom targeting, and submission visibility.'
              : 'Student flow keeps deadline, attachments, notes, and status in one place.'}
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

      <section className="task-list">
        {tasks.map((task) => {
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
                    task.submissions.map((item) => (
                      <div key={item.userId} className="submission-card">
                        <strong>{state.users.find((user) => user.id === item.userId)?.name ?? item.userId}</strong>
                        <small>{item.status}</small>
                        <p>{item.note || 'No note yet.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="empty-panel">No submissions yet.</div>
                  )}
                </div>
              ) : (
                <div className="submission-editor">
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
                  <div className="button-row button-row--end">
                    <span className="status-pill">
                      {submission?.status ?? 'pending'}
                    </span>
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

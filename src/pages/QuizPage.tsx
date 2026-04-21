import { useState } from 'react';
import { MetricTile } from '../components/ChartBlocks';
import { useApp } from '../app/AppState';
import { formatRelativeDate, getUserById, getVisibleQuizzes } from '../utils/selectors';

export function QuizPage() {
  const { currentRole, currentUser, state, submitQuiz } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const quizzes = getVisibleQuizzes(state, currentUser);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, number[]>>({});

  const totalResponses = quizzes.reduce((total, quiz) => total + quiz.responses.length, 0);
  const averageScore = quizzes.length
    ? quizzes.reduce((total, quiz) => (
        total + quiz.responses.reduce((sum, response) => sum + response.score, 0)
      ), 0) / Math.max(totalResponses, 1)
    : 0;

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Quizzes' : 'Quizzes'}</div>
          <h1 className="hero-panel__title">
            {currentRole === 'teacher'
              ? isEnglish
                ? 'Follow quick checks, completion, and class practice signals.'
                : 'Acompanhe verificacoes rapidas, conclusao e sinais de pratica da turma.'
              : isEnglish
                ? 'Practice in small rounds and see your score instantly.'
                : 'Pratique em rodadas curtas e veja sua pontuacao na hora.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'This restores the quiz flow from the HTML prototype as a clean React experience.'
              : 'Aqui o fluxo de quiz do HTML volta como uma experiencia React limpa.'}
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <MetricTile label={isEnglish ? 'Quizzes' : 'Quizzes'} value={quizzes.length} accent="blue" />
        <MetricTile label={isEnglish ? 'Responses' : 'Respostas'} value={totalResponses} accent="green" />
        <MetricTile label={isEnglish ? 'Average score' : 'Media'} value={averageScore.toFixed(1)} accent="yellow" />
        <MetricTile label={isEnglish ? 'Active classes' : 'Turmas ativas'} value={new Set(quizzes.map((quiz) => quiz.classroom).filter(Boolean)).size} accent="pink" />
      </div>

      <section className="quiz-list">
        {quizzes.map((quiz) => {
          const studentResponse = quiz.responses.find((response) => response.userId === currentUser?.id);
          const draft = answerDrafts[quiz.id] ?? studentResponse?.answers ?? [];

          return (
            <article className="quiz-card" key={quiz.id}>
              <div className="task-card__header">
                <div>
                  <div className="panel-card__eyebrow">{quiz.subject}</div>
                  <h2>{quiz.title}</h2>
                  <p>{quiz.description}</p>
                </div>
                <div className="task-card__meta">
                  <span className="status-pill">{quiz.classroom ? `${isEnglish ? 'Class' : 'Turma'} ${quiz.classroom}` : 'Geral'}</span>
                  <small>{isEnglish ? 'Closes' : 'Fecha'} {quiz.closesAt}</small>
                </div>
              </div>

              {currentRole === 'teacher' ? (
                <div className="submission-list">
                  {quiz.responses.length ? (
                    quiz.responses.map((response) => {
                      const student = getUserById(state, response.userId);
                      return (
                        <div className="submission-card submission-card--rich" key={response.userId}>
                          <strong>{student?.name ?? response.userId}</strong>
                          <small>{formatRelativeDate(response.submittedAt)}</small>
                          <span className="status-pill">{isEnglish ? 'Score' : 'Nota'} {response.score}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-panel">{isEnglish ? 'No responses yet.' : 'Nenhuma resposta ainda.'}</div>
                  )}
                </div>
              ) : (
                <div className="stack-gap-sm">
                  {quiz.questions.map((question, questionIndex) => (
                    <div className="quiz-question" key={question.id}>
                      <strong>{question.prompt}</strong>
                      <div className="quiz-options">
                        {question.options.map((option, optionIndex) => (
                          <button
                            className={draft[questionIndex] === optionIndex ? 'quiz-option quiz-option--selected' : 'quiz-option'}
                            key={option}
                            type="button"
                            onClick={() => {
                              const nextAnswers = [...draft];
                              nextAnswers[questionIndex] = optionIndex;
                              setAnswerDrafts((current) => ({ ...current, [quiz.id]: nextAnswers }));
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="button-row button-row--end">
                    {studentResponse ? (
                      <span className="status-pill">
                        {isEnglish ? 'Last score' : 'Ultima nota'} {studentResponse.score}
                      </span>
                    ) : null}
                    <button
                      className="solid-button"
                      type="button"
                      onClick={() => submitQuiz(quiz.id, draft)}
                    >
                      {studentResponse ? (isEnglish ? 'Update answers' : 'Atualizar respostas') : (isEnglish ? 'Send answers' : 'Enviar respostas')}
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
